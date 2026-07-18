import { BrevoClient } from '@getbrevo/brevo';
const { BREVO_API_KEY } = process.env;

const client = new BrevoClient({
    apiKey: BREVO_API_KEY
})

export default client;


