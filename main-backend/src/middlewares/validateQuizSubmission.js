const validateQuizSubmission = (req, res, next) => {
    const { responses } = req.body;
  
    if (!Array.isArray(responses) || responses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Quiz responses are required'
      });
    }
  
    for (const response of responses) {
      if (!response.question_id || !Number.isInteger(response.question_id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid question_id is required for each response'
        });
      }
  
      if (typeof response.selected_option !== 'number' || 
          response.selected_option < 0 || 
          response.selected_option > 3) {
        return res.status(400).json({
          success: false,
          message: 'Valid selected_option (0-3) is required for each response'
        });
      }
    }
  
    next();
  };
  
  export default validateQuizSubmission;