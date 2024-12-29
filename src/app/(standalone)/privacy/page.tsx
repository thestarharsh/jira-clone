import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Privacy = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Privacy Policy</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg leading-6 mb-4">
                        Welcome to our Privacy Policy page. Your privacy is critically important to us.
                    </p>

                    <h3 className="text-xl font-semibold mt-6 mb-2">
                        Information We Collect
                    </h3>
                    <p className="text-base leading-6 mb-4">
                        We collect information to provide better services to all our users. This includes:
                    </p>
                    <ul className="list-disc ml-6 mt-2">
                        <li>Personal data like name, email address, and phone number.</li>
                        <li>Usage data such as pages visited and time spent on the website.</li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-6 mb-2">
                        How We Use Your Information
                    </h3>
                    <p className="text-base leading-6 mb-4">
                        We use the information we collect in various ways, including to:
                    </p>
                    <ul className="list-disc ml-6 mt-2">
                        <li>Provide, operate, and maintain our website.</li>
                        <li>Improve, personalize, and expand our website.</li>
                        <li>Understand and analyze how you use our website.</li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-6 mb-2">
                        Data Protection
                    </h3>
                    <p className="text-base leading-6 mb-4">
                        We prioritize protecting your data and ensure that all necessary measures are taken to safeguard your personal information.
                    </p>

                    <h3 className="text-xl font-semibold mt-6 mb-2">
                        Contact Us
                    </h3>
                    <p className="text-base leading-6">
                        If you have any questions about our Privacy Policy, please contact us at:
                        <br />
                        <a href="mailto:talatiharsh19@gmail.com" className="text-blue-500 hover:underline">talatiharsh19@gmail.com</a>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default Privacy;
