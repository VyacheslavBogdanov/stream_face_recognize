import express from 'express';
const app = express();
import cors from 'cors';
app.use(cors());

const PORT = 4000;

const getRandomStatus = () => {
  return Math.random() > 0.5 ? 'active' : 'inactive';
};

app.get('/', (req, res) => {
  const randomStatus = getRandomStatus();
  return res.json({ status: randomStatus });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен по адресу: http://localhost:${PORT}`);
});
