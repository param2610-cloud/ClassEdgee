const data = {
    1: {
        "Mathematics –IA": {
            1: {
                topic: [
                    "Evolutes and involutes",
                    "Evaluation of definite and improper integrals",
                    "Beta and Gamma functions and their properties",
                    "Applications of definite integrals to evaluate surface areas and volumes of revolutions",
                ],
            },
            2: {
                topic: [
                    "Rolle’s Theorem",
                    "Mean value theorems",
                    "Taylor’s and Maclaurin’s theorems with remainders",
                    "Indeterminate forms and L'Hospital's rule",
                    "Maxima and minima",
                ],
            },
            3: {
                topic: [
                    "Matrices and Vectors: addition and scalar multiplication, matrix multiplication",
                    "Linear systems of equations, linear Independence, rank of a matrix",
                    "Determinants, Cramer’s Rule, inverse of a matrix",
                    "Gauss elimination and Gauss-Jordan elimination",
                ],
            },
            4: {
                topic: [
                    "Vector Space, linear dependence of vectors, Basis, Dimension",
                    "Linear transformations (maps), Range and Kernel of a linear map",
                    "Rank and Nullity, Inverse of a linear transformation",
                    "Rank-Nullity theorem, composition of linear maps",
                    "Matrix associated with a linear map",
                ],
            },
        },
        "chemistry –IA": {
            1: {
                topic: [
                    "Evolutes and involutes",
                    "Evaluation of definite and improper integrals",
                    "Beta and Gamma functions and their properties",
                    "Applications of definite integrals to evaluate surface areas and volumes of revolutions",
                ],
            },
            2: {
                topic: [
                    "Rolle’s Theorem",
                    "Mean value theorems",
                    "Taylor’s and Maclaurin’s theorems with remainders",
                    "Indeterminate forms and L'Hospital's rule",
                    "Maxima and minima",
                ],
            },
            3: {
                topic: [
                    "Matrices and Vectors: addition and scalar multiplication, matrix multiplication",
                    "Linear systems of equations, linear Independence, rank of a matrix",
                    "Determinants, Cramer’s Rule, inverse of a matrix",
                    "Gauss elimination and Gauss-Jordan elimination",
                ],
            },
            4: {
                topic: [
                    "Vector Space, linear dependence of vectors, Basis, Dimension",
                    "Linear transformations (maps), Range and Kernel of a linear map",
                    "Rank and Nullity, Inverse of a linear transformation",
                    "Rank-Nullity theorem, composition of linear maps",
                    "Matrix associated with a linear map",
                ],
            },
        },
    },
};

for (let key in data) {
    console.log(data[key]);
}

//   // Method 1: Using Object.keys()
//   const keys = Object.keys(data["1"]["Mathematics –IA"]);
//   keys.forEach(key => {
//     console.log(`Key: ${key}`);
//     console.log(`Topics:`, data["1"]["Mathematics –IA"][key]["topic"]);
//   });

//   // Method 2: Using for...in loop
//   for (let key in data["1"]["Mathematics –IA"]) {
//     console.log(`Key: ${key}`);
//     console.log(`Topics:`, data["1"]["Mathematics –IA"][key]["topic"]);
//   }
