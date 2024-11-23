import { PrismaClient } from "@prisma/client";
// get activity
const getActivity = async (req, res) => {
  const { 
    user_id, 
    activity_type, 
    description, 
    ip_address, 
    user_agent 
  } = req.body;

  try {
    const activity = await PrismaClient.activitylogs.create({
      data: {
        user_id,
        activity_type,
        description,
        ip_address,
        user_agent
      }
    });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//add activity
const addActivity =  async (req, res) => {
  try {
    const activities = await PrismaClient.activitylogs.findMany({
      include: {
        users: {
          select: { first_name: true, last_name: true }
        }
      }
    });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export{getActivity,addActivity}