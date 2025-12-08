import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import notFound from './app/middlewares/notFound';
import config from './config';
import router from './app/routes';
import globalErrorHandler from "./app/middlewares/globalErrorHandler";

const app: Application = express();

// app.post("/webhook", express.raw({ type: "application/json" }), paymentController.handleStripeWebhookEvent);

app.use(cors({
    origin: [
        "http://localhost:3000",
        "https://local-guide-frontend-mocha.vercel.app"
    ],
    credentials: true
}));

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", router);

// cron.schedule('* * * * *', () => {
//     try {
//         appointmentService.cancelUnpaidAppointments();
//         console.log("Node cron called at ", new Date());
//     } catch (err) {
//         console.error(err);
//     }
// });

app.get("/", (req: Request, res: Response) => {
    res.send({
        message: "Server is running..",
        environment: config.node_env,
        uptime: process.uptime().toFixed(2) + " sec",
        timeStamp: new Date().toISOString()
    })
});


app.use(globalErrorHandler);
app.use(notFound);

export default app;