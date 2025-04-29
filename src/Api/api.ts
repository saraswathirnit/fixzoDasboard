import axios from 'axios';

export const getDashboardData = async () => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_DASHBOARD_BASE_URL}/getDashboardData`);
    return {
      ok: true,
      json: async () => response.data
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch dashboard data: ${error.message}`);
    }
    throw error;
  }
};

