import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getAllEquipment = async (req, res) => {
  try {
    console.log("adas");
    
    const equipment = await prisma.equipment.findMany({
      include: { rooms: true }
    });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await prisma.equipment.findUnique({
      where: { equipment_id: parseInt(id) },
      include: { rooms: true }
    });
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createEquipment = async (req, res) => {
  try {
    const {
      name,
      type,
      room_id,
      serial_number,
      purchase_date,
      warranty_end_date,
      specifications,
      maintenance_schedule
    } = req.body;

    const equipment = await prisma.equipment.create({
      data: {
        name,
        type,
        room_id: room_id ? parseInt(room_id) : null,
        serial_number,
        purchase_date: purchase_date ? new Date(purchase_date) : null,
        warranty_end_date: warranty_end_date ? new Date(warranty_end_date) : null,
        specifications,
        maintenance_schedule
      }
    });
    res.status(201).json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateEquipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const equipment = await prisma.equipment.update({
      where: { equipment_id: parseInt(id) },
      data: { status }
    });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const scheduleMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const { maintenance_date } = req.body;

    const equipment = await prisma.equipment.update({
      where: { equipment_id: parseInt(id) },
      data: {
        status: 'maintenance',
        next_maintenance_date: new Date(maintenance_date)
      }
    });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEquipmentByRoom = async (req, res) => {
  try {
    const { room_id } = req.params;
    const equipment = await prisma.equipment.findMany({
      where: { room_id: parseInt(room_id) }
    });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateEquipment = async (req, res) => {
    try {
      const { id } = req.params;
      const equipment = await prisma.equipment.update({
        where: { equipment_id: parseInt(id) },
        data: req.body
      });
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };