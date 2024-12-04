import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
const app = express();
app.use(cors());
app.use(express.json());
const PORT = 4000;

const getRandomStatus = () => {
	return Math.random() > 0.5 ? 'active' : 'inactive';
};

app.get('/', (req, res) => {
	const randomStatus = getRandomStatus();
	return res.json({ status: randomStatus });
});


const getFireDetectionResult = () => {
	return Math.random() > 0.5 ? 'fire' : 'no_fire';
  };


  app.post('/predict', (req, res) => {
	if (!req.body || !req.body.thresholds || !req.body.sabotage_threshold || req.body.image === undefined) {
	  return res.status(400).json({ error: 'Invalid request body' });
	}
	const requestId = uuidv4();
	const fireResult = getFireDetectionResult();
	const response = {
	  requestId,
	  objectCount: 1,
	  objects: [
		{
		  id: 0,
		  type: fireResult,
		  rect: [0, 0, 0, 0],
		  confidence: fireResult === 'fire' ? 0.9 : 0,
		  velocity: -1,
		},
	  ],
	  time: {
		preprocess: 0,
		inference: 0,
		tracking: 0,
		postprocess: 0,
		sabotage_cheking: 0,
	  },
	  sabotage_check: 0,
	};
	res.json(response);
  });


  app.listen(PORT, () => {
	console.log(`Сервер запущен по адресу: http://localhost:${PORT}`);
});
