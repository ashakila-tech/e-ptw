import 'dotenv/config';

export default ({ config }) => {
  return {
    ...config,
    extra: {
      API_BASE_URL: process.env.API_BASE_URL,
    },
  };
};
