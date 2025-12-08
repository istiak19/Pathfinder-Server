/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios"
import httpStatus from "http-status"
import { ISSLCommerz } from "./sslCommerz.interface"
import { envVars } from "../../../config/env"
import { AppError } from "../../errors/AppError"
import { prisma } from "../../shared/prisma"

const sslPaymentInit = async (payload: ISSLCommerz) => {

    try {
        const data = {
            store_id: envVars.SSL.STORE_ID,
            store_passwd: envVars.SSL.STORE_PASS,
            total_amount: payload.amount,
            currency: "BDT",
            tran_id: payload.transactionId,
            success_url: `${envVars.SSL.SSL_SUCCESS_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=success`,
            fail_url: `${envVars.SSL.SSL_FAIL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=fail`,
            cancel_url: `${envVars.SSL.SSL_CANCEL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=cancel`,
            ipn_url: envVars.SSL.SSL_IPN_URL,
            shipping_method: "N/A",
            product_name: "Tour",
            product_category: "Service",
            product_profile: "general",
            cus_name: `Listing booking for ${payload.name}`,
            cus_email: payload.email,
            cus_add1: "Mirpur",
            cus_add2: "N/A",
            cus_city: "Dhaka",
            cus_state: "Dhaka",
            cus_postcode: "1000",
            cus_country: "Bangladesh",
            cus_phone: "0000000000",
            cus_fax: "01711111111",
            ship_name: "N/A",
            ship_add1: "N/A",
            ship_add2: "N/A",
            ship_city: "N/A",
            ship_state: "N/A",
            ship_postcode: 1000,
            ship_country: "N/A",
        }

        const response = await axios({
            method: "POST",
            url: envVars.SSL.SSL_PAYMENT_API,
            data: data,
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        })

        return response.data;

    } catch (error: any) {
        console.log("Payment Error Occurred", error);
        throw new AppError(httpStatus.BAD_REQUEST, error.message)
    }
}

const validatePayment = async (payload: any) => {
    try {
        const validationUrl =
            `${process.env.SSL_VALIDATION_API}` +
            `?val_id=${payload.val_id}` +
            `&store_id=${process.env.SSL_STORE_ID}` +
            `&store_passwd=${process.env.SSL_STORE_PASS}` +
            `&format=json`;

        const { data } = await axios.get(validationUrl);

        console.log("SSLCommerz validate response:", data);

        // Check if payment exists
        const payment = await prisma.payment.findUnique({
            where: {
                transactionId: payload.tran_id,
            },
        });

        if (!payment) {
            throw new Error("Payment record not found for this transaction");
        }

        // 🔥 Only update paymentGatewayData (no status update)
        await prisma.payment.update({
            where: {
                transactionId: payload.tran_id,
            },
            data: {
                paymentGatewayData: data,
            },
        });

        return true;
    } catch (error: any) {
        console.log("Validate Payment Error:", error.message);
        throw new AppError(
            401,
            `Payment Validation Error: ${error.message}`
        );
    }
};

export const SSLService = {
    sslPaymentInit,
    validatePayment
}