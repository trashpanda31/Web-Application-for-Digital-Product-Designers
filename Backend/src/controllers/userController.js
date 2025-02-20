export const getUserProfile = async (req, res) => {
  try {
    res.json({ message: 'User profile route works' });
    }catch(error) {
      res.status(500).json({ message: 'Server Error' });
  }
}