import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

// Create a new room
const createRoom = async (req, res) => {
  try {
    const { 
      floor_number, 
      room_number, 
      room_type, 
      capacity, 
      wing,
      area_sqft,
      features
    } = req.body;

    // Validate room type
    const validRoomTypes = ['classroom', 'lab', 'seminar_hall', 'auditorium'];
    if (!validRoomTypes.includes(room_type)) {
      return res.status(400).send({ 
        success: false,
        message: 'Invalid room type',
        validTypes: validRoomTypes
      });
    }

    // Check if room number is unique
    const existingRoom = await prismaClient.rooms.findUnique({
      where: { room_number }
    });

    if (existingRoom) {
      return res.status(400).send({ 
        success: false,
        message: `Room number ${room_number} already exists`
      });
    }

    // Create the room
    const newRoom = await prismaClient.rooms.create({
      data: {
        room_number,
        room_type,
        capacity:parseInt(capacity),
        floor_number: parseInt(floor_number),
        wing,
        area_sqft: area_sqft ? parseFloat(area_sqft.toString()) : null,
        features: features ? JSON.parse(JSON.stringify(features)) : null,
        status: 'available'
      }
    });

    return res.status(201).send({
      success: true,
      message: "Room created successfully",
      data: newRoom
    });
  } catch (error) {
    console.error('Error creating room:', error);

    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      const field = error.meta.target[0];
      return res.status(400).send({
        success: false,
        message: `${field} is already in use`,
        field: field,
        errorCode: error.code
      });
    }

    return res.status(500).send({ 
      success: false,
      message: 'Failed to create room',
      error: error.message
    });
  }
};

// Get rooms on a specific floor
const getRoomsOnFloor = async (req, res) => {
  try {
    const { floor_number } = req.params;
    const rooms = await prismaClient.rooms.findMany({
      where: {
        floor_number: parseInt(floor_number)
      },
      orderBy: {
        room_number: 'asc'
      }
    });
    return res.status(200).send({
      success: true,
      data: rooms
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return res.status(500).send({ 
      success: false,
      message: 'Failed to fetch rooms',
      error: error.message
    });
  }
};

// Get room details
const getRoomDetails = async (req, res) => {
  try {
    const { room_number } = req.params;
    const room = await prismaClient.rooms.findUnique({
      where: { room_number: room_number },
      include: {
        buildings: true,
        classes: true
      }
    });
    if (!room) {
      return res.status(404).send({ 
        success: false,
        message: 'Room not found'
      });
    }
    return res.status(200).send({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Error fetching room details:', error);
    return res.status(500).send({ 
      success: false,
      message: 'Failed to fetch room details',
      error: error.message
    });
  }
};

// Update room details
const updateRoom = async (req, res) => {
  try {
    const { room_number } = req.params;
    const updateData = req.body;

    // Validate room type if provided
    const validRoomTypes = ['classroom', 'lab', 'seminar_hall', 'auditorium'];
    if (updateData.room_type && !validRoomTypes.includes(updateData.room_type)) {
      return res.status(400).send({ 
        success: false,
        message: 'Invalid room type',
        validTypes: validRoomTypes
      });
    }

    // Convert building_id and floor_number to integers if they exist in updateData
    if (updateData.building_id) {
      updateData.building_id = parseInt(updateData.building_id);
    }
    if (updateData.floor_number) {
      updateData.floor_number = parseInt(updateData.floor_number);
    }

    // Check if the room exists
    const existingRoom = await prismaClient.rooms.findUnique({
      where: { room_number: room_number },
    });

    if (!existingRoom) {
      return res.status(404).send({
        success: false,
        message: "Room not found",
      });
    }

    const updatedRoom = await prismaClient.rooms.update({
      where: { room_number: room_number },
      data: {
        ...updateData,
        updated_at: new Date()
      }
    });

    return res.status(200).send({
      success: true,
      message: "Room updated successfully",
      data: updatedRoom
    });
  } catch (error) {
    console.error('Error updating room:', error);

    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      const field = error.meta.target[0];
      return res.status(400).send({
        success: false,
        message: `${field} is already in use`,
        field: field,
        errorCode: error.code
      });
    }

    return res.status(500).send({ 
      success: false,
      message: 'Failed to update room',
      error: error.message
    });
  }
};

// Delete room
const deleteRoom = async (req, res) => {
  try {
    const { room_number } = req.params;
    // First find the room
    const room = await prismaClient.rooms.findUnique({
      where: { room_number: room_number },
    });
    if (!room) {
      return res.status(404).send({
        success: false,
        message: "Room not found",
      });
    }
    // Delete room record
    await prismaClient.rooms.delete({
      where: { room_number: room_number },
    });
    res.status(200).send({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).send({
      success: false,
      message: "Failed to delete room",
      error: error.message,
    });
  }
};

const fetchRoomList = async (req, res) => { 
  try {
      const rooms = await prismaClient.rooms.findMany()
      res.status(200).send({
          success: true,
          data: rooms
      })
  } catch (error) {
    console.error('Error fetching room details:', error);
    res.status(500).send({
      success: false,
      message: 'Failed to fetch room details',
      error: error.message
    });
  }
};

const createBuilding = async (req, res) => {
  try {
    const { building_name, floors, location_coordinates } = req.body;


    const building = await prismaClient.buildings.create({
      data: {
        building_name,
        floors,
      }
    });
    res.status(201).json({ success: true, data: building });
  } catch (error) {
    console.error('Error creating building:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getBuildings = async (req, res) => {
  try {
    console.log('Fetching buildings...');
    
    const buildings = await prismaClient.buildings.findMany({
      include: {
        rooms: true
      }
    });
    res.status(200).json({ success: true, data: buildings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateRoomMaintenance = async (req, res) => {
  try {
    const { room_number } = req.params;
    const { status, last_maintenance_date, next_maintenance_date } = req.body;
    
    const room = await prismaClient.rooms.update({
      where: { room_number },
      data: {
        status,
        last_maintenance_date: new Date(last_maintenance_date),
        next_maintenance_date: new Date(next_maintenance_date)
      }
    });
    
    res.status(200).json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getRoomsByBuilding = async (req, res) => {
  try {
    const { building_id } = req.params;
    const rooms = await prismaClient.rooms.findMany({
      where: { building_id: parseInt(building_id) },
      include: {
        buildings: true
      }
    });
    res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateBuilding = async (req, res) => {
  try {
    const { building_id } = req.params;
    const { rooms, ...updateData } = req.body;

    const updatedBuilding = await prismaClient.buildings.update({
      where: { building_id: parseInt(building_id) },
      data: updateData
    });

    res.status(200).json({ success: true, data: updatedBuilding });
  } catch (error) {
    console.error('Error updating building:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateRoomStatus = async (req, res) => {
  try {
    const { room_number } = req.params;
    const { status } = req.body;

    const validStatuses = ['available', 'in_use', 'maintenance'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const updatedRoom = await prismaClient.rooms.update({
      where: { room_number },
      data: { 
        status,
        next_maintenance_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        // Reset last maintenance date if status is changed from maintenance
        ...(status !== 'maintenance' && {
          last_maintenance_date: null
        })
      }
    });

    res.status(200).json({ success: true, data: updatedRoom });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export {
  createRoom,
  getRoomsOnFloor,
  getRoomDetails,
  updateRoom,
  deleteRoom,
  fetchRoomList,
  createBuilding,
  getBuildings,
  updateRoomMaintenance,
  getRoomsByBuilding,
  updateBuilding, // Add this line
  updateRoomStatus
};