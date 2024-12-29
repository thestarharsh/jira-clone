import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Terms = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Terms of Service</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg leading-6 mb-4">
                        Welcome to our Terms of Service page. By using our platform, you agree to the following terms and conditions.
                    </p>

                    <h3 className="text-xl font-semibold mt-6 mb-2">
                        1. Acceptance of Terms
                    </h3>
                    <p className="text-base leading-6 mb-4">
                        By accessing or using our Jira platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with these terms, you must not use the platform.
                    </p>

                    <h3 className="text-xl font-semibold mt-6 mb-2">
                        2. Account Responsibilities
                    </h3>
                    <p className="text-base leading-6 mb-4">
                        You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                    </p>

                    <h3 className="text-xl font-semibold mt-6 mb-2">
                        3. User Content
                    </h3>
                    <p className="text-base leading-6 mb-4">
                        You retain ownership of the content you upload to the platform. However, by using the platform, you grant us a license to use, display, and distribute your content to provide the services.
                    </p>

                    <h3 className="text-xl font-semibold mt-6 mb-2">
                        4. Restrictions
                    </h3>
                    <p className="text-base leading-6 mb-4">
                        You agree not to use the platform for any illegal or unauthorized purposes, including but not limited to:
                    </p>
                    <ul className="list-disc ml-6 mt-2">
                        <li>Engaging in any activities that violate local, national, or international laws.</li>
                        <li>Attempting to interfere with the functionality or security of the platform.</li>
                        <li>Distributing harmful software or malicious content.</li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-6 mb-2">
                        5. Termination of Access
                    </h3>
                    <p className="text-base leading-6 mb-4">
                        We reserve the right to suspend or terminate your access to the platform at our discretion, without prior notice, for violation of these Terms of Service.
                    </p>

                    <h3 className="text-xl font-semibold mt-6 mb-2">
                        6. Limitation of Liability
                    </h3>
                    <p className="text-base leading-6 mb-4">
                        We will not be held liable for any damages arising from the use or inability to use the platform, including direct, indirect, incidental, or consequential damages.
                    </p>

                    <h3 className="text-xl font-semibold mt-6 mb-2">
                        7. Governing Law
                    </h3>
                    <p className="text-base leading-6 mb-4">
                        These Terms of Service are governed by and construed in accordance with the laws of the jurisdiction in which our company is located.
                    </p>

                    <h3 className="text-xl font-semibold mt-6 mb-2">
                        8. Changes to Terms
                    </h3>
                    <p className="text-base leading-6 mb-4">
                        We may update these Terms of Service from time to time. Any changes will be communicated on this page, and your continued use of the platform will signify your acceptance of the updated terms.
                    </p>

                    <h3 className="text-xl font-semibold mt-6 mb-2">
                        9. Contact Us
                    </h3>
                    <p className="text-base leading-6">
                        If you have any questions about these Terms of Service, please contact us at:
                        <br />
                        <a href="mailto:talatiharsh19@gmail.com" className="text-blue-500 hover:underline">talatiharsh19@gmail.com</a>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default Terms;
