"""
InsightFace Service Module for ClassEdgee
Provides face detection and recognition using InsightFace library with CPU-optimized settings.
Designed for free-tier cloud deployment (512MB RAM limit).
"""

import os
import numpy as np
import pickle
import requests
from typing import List, Dict, Optional, Tuple
from functools import lru_cache
import gc

# Lazy import to save memory until needed
_face_app = None

def get_face_app():
    """
    Lazy-load and cache the InsightFace application.
    Uses buffalo_s model which is optimized for CPU and low memory.
    """
    global _face_app
    if _face_app is None:
        import insightface
        from insightface.app import FaceAnalysis
        
        # Use buffalo_s - smallest model, optimized for CPU
        # Total size ~50MB, suitable for 512MB RAM
        _face_app = FaceAnalysis(
            name='buffalo_s',
            root='./insightface_models',
            providers=['CPUExecutionProvider']
        )
        # ctx_id=-1 forces CPU usage
        # det_size reduces detection resolution for faster processing
        _face_app.prepare(ctx_id=-1, det_size=(320, 320))
    
    return _face_app


def release_face_app():
    """
    Release the face app to free memory.
    Useful after batch processing or when memory is tight.
    """
    global _face_app
    if _face_app is not None:
        del _face_app
        _face_app = None
        gc.collect()


class InsightFaceService:
    """
    Service class for face recognition operations using InsightFace.
    Optimized for low-memory environments (free tier cloud deployment).
    """
    
    def __init__(self):
        self.similarity_threshold = 0.4  # InsightFace uses cosine similarity
    
    def detect_faces(self, image: np.ndarray) -> List[Dict]:
        """
        Detect faces in an image and return face data including embeddings.
        
        Args:
            image: BGR image as numpy array (OpenCV format)
            
        Returns:
            List of dicts containing face bounding box and embedding
        """
        app = get_face_app()
        faces = app.get(image)
        
        results = []
        for face in faces:
            results.append({
                'bbox': face.bbox.tolist(),
                'embedding': face.embedding,
                'det_score': float(face.det_score),
                'landmark': face.landmark.tolist() if face.landmark is not None else None
            })
        
        return results
    
    def get_face_embedding(self, image: np.ndarray) -> Optional[np.ndarray]:
        """
        Get the embedding for the largest/primary face in an image.
        
        Args:
            image: BGR image as numpy array
            
        Returns:
            512-dimensional face embedding or None if no face detected
        """
        faces = self.detect_faces(image)
        if not faces:
            return None
        
        # Return embedding of face with highest detection score
        best_face = max(faces, key=lambda x: x['det_score'])
        return best_face['embedding']
    
    def process_images_for_registration(
        self, 
        image_paths: List[str], 
        enrollment: str
    ) -> List[Dict]:
        """
        Process multiple images and extract face embeddings for registration.
        
        Args:
            image_paths: List of file paths to face images
            enrollment: Student enrollment number
            
        Returns:
            List of dicts containing enrollment and embeddings
        """
        import cv2
        
        all_embeddings = []
        
        for image_path in image_paths:
            try:
                # Load image
                image = cv2.imread(image_path)
                if image is None:
                    print(f"Could not load image: {image_path}")
                    continue
                
                # Get face embedding
                embedding = self.get_face_embedding(image)
                
                if embedding is not None:
                    all_embeddings.append({
                        'enrollment': enrollment,
                        'embedding': embedding
                    })
                    
            except Exception as e:
                print(f"Error processing image {image_path}: {str(e)}")
                continue
        
        return all_embeddings
    
    def compare_faces(
        self, 
        embedding1: np.ndarray, 
        embedding2: np.ndarray
    ) -> Tuple[bool, float]:
        """
        Compare two face embeddings using cosine similarity.
        
        Args:
            embedding1: First face embedding
            embedding2: Second face embedding
            
        Returns:
            Tuple of (is_match, similarity_score)
        """
        # Normalize embeddings
        emb1_norm = embedding1 / np.linalg.norm(embedding1)
        emb2_norm = embedding2 / np.linalg.norm(embedding2)
        
        # Cosine similarity
        similarity = np.dot(emb1_norm, emb2_norm)
        
        is_match = similarity >= self.similarity_threshold
        return is_match, float(similarity)
    
    def find_matching_face(
        self, 
        query_embedding: np.ndarray, 
        known_faces: Dict[str, List[Dict]]
    ) -> Optional[Tuple[str, float]]:
        """
        Find the best matching face from known faces database.
        
        Args:
            query_embedding: Embedding of face to identify
            known_faces: Dict mapping enrollment to list of stored embeddings
            
        Returns:
            Tuple of (enrollment, confidence) or None if no match
        """
        best_match = None
        best_similarity = self.similarity_threshold
        
        for enrollment, student_embeddings in known_faces.items():
            for stored in student_embeddings:
                stored_embedding = stored.get('embedding')
                if stored_embedding is None:
                    continue
                
                # Convert to numpy array if needed
                if not isinstance(stored_embedding, np.ndarray):
                    stored_embedding = np.array(stored_embedding)
                
                is_match, similarity = self.compare_faces(
                    query_embedding, 
                    stored_embedding
                )
                
                if is_match and similarity > best_similarity:
                    best_similarity = similarity
                    best_match = enrollment
        
        if best_match:
            return (best_match, best_similarity)
        return None
    
    async def load_model_from_url(self, model_url: str) -> Dict:
        """
        Load face recognition model (pickle) from URL.
        
        Args:
            model_url: URL to the pickled model file
            
        Returns:
            Dict of enrollment -> embeddings
        """
        if not model_url:
            return {}
        
        try:
            response = requests.get(model_url, timeout=30)
            response.raise_for_status()
            return pickle.loads(response.content)
        except Exception as e:
            print(f"Error loading model from {model_url}: {str(e)}")
            return {}
    
    def save_model(self, model_path: str, embeddings: Dict) -> None:
        """
        Save face embeddings model to file.
        
        Args:
            model_path: Path to save the model
            embeddings: Dict of enrollment -> embeddings
        """
        # Convert numpy arrays to lists for better pickle compatibility
        serializable = {}
        for enrollment, emb_list in embeddings.items():
            serializable[enrollment] = []
            for emb in emb_list:
                entry = emb.copy()
                if isinstance(entry.get('embedding'), np.ndarray):
                    entry['embedding'] = entry['embedding'].tolist()
                serializable[enrollment].append(entry)
        
        with open(model_path, 'wb') as f:
            pickle.dump(serializable, f)


def convert_legacy_model(legacy_model: Dict) -> Dict:
    """
    Convert face_recognition library model to InsightFace format.
    This is a one-time migration helper.
    
    Note: Direct conversion is not possible as embedding dimensions differ.
    This function marks entries for re-registration.
    
    Args:
        legacy_model: Model from face_recognition library
        
    Returns:
        Dict with entries marked for re-registration
    """
    converted = {}
    for enrollment, embeddings in legacy_model.items():
        converted[enrollment] = [{
            'enrollment': enrollment,
            'embedding': None,  # Needs re-registration
            'legacy_encoding': emb.get('encoding'),  # Keep for reference
            'needs_reregistration': True
        } for emb in embeddings]
    
    return converted
