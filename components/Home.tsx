import Link from "next/link";
import Countdown from "./CountDown";

export default function Home(){
    return (
        <div className="flex flex-col items-center scroll-smooth">
        <section className="container mx-auto px-6 py-12 flex flex-col md:flex-row items-center md:space-x-10">
        <div className="w-full md:w-1/2">
            <div className="relative w-full h-70 md:h-70">
              <img
                src={"../image1.jpg"} // Replace with your image path
                alt="Project Management"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl font-semibold text-gray-800">
              Project Hive
            </h1>
            <p className="mt-4 text-gray-600">
                Your Final Year Project Manager.
            </p>
            <Link href="/pages/register" className="mt-2 w-40 flex  justify-center rounded-md bg-emerald-700 px-1 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">Join the Hive!</Link>
          </div>
  
          
        </section>

        <section className="w-full py-12 bg-emerald-700">
          <h2 className="text-4xl font-bold text-center text-white md:text-5xl lg:text-6xl">
            Welcome to Project Hive
          </h2>
          <p className="mt-4 text-center text-white md:text-lg">
          With Project Hive, you have the ability to monitor progress. This tool is designed to improve project workflow, making it easy to track and manage every stage.
          </p>
        </section>
        
        <Countdown></Countdown>
  
        {/* Scroll Down Section */}
        <section id="scroll-down" className="w-full py-12 bg-gray-100">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800">
              Discover More
            </h2>
            <p className="mt-2 text-gray-600">
              Scroll down to learn more about our features and offerings.
            </p>
            <a
              href="#more-info"
              className="mt-4 inline-block bg-emerald-700 text-white py-2 px-4 rounded-md hover:bg-emerald-800"
            >
              Scroll Down
            </a>
          </div>
        </section>

        {/* Additional Info Section */}
        <section id="more-info" className="w-full py-12 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-3xl font-semibold text-gray-800">
              More About Project Hive
            </h3>
            <p className="mt-4 text-gray-600">
              Project Hive is a comprehensive tool designed to help manage and organize all aspects of your project, from planning to execution. Tailored for educators, students, and admins alike, Project Hive brings a new level of efficiency to project management.
            </p>
          </div>
        </section>

        {/* How Project Hive Works Section */}
        <section id="how-it-works" className="w-full py-12 bg-gray-50">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-3xl font-semibold text-gray-800">
              How Project Hive Works
            </h3>
            <p className="mt-4 text-gray-600">
              Project Hive streamlines the project management process by allowing users to create, assign, and track projects in a simple and intuitive interface. Whether you're a student, lecturer, or admin, the platform makes it easy to stay on top of tasks, deadlines, and progress.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 bg-emerald-100">
          <div className="max-w-5xl mx-auto text-center">
            <h3 className="text-3xl font-semibold text-gray-800">
              Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h4 className="text-xl font-semibold text-gray-800">Project Tracking</h4>
                <p className="mt-2 text-gray-600">Easily track project progress with clear milestones and deadlines to ensure everything stays on track.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h4 className="text-xl font-semibold text-gray-800">Collaborative Tools</h4>
                <p className="mt-2 text-gray-600">Collaborate efficiently with team members, share feedback, and work together seamlessly on projects.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h4 className="text-xl font-semibold text-gray-800">Role-based Access</h4>
                <p className="mt-2 text-gray-600">Manage different roles within the platform and provide customized access to students, lecturers, and admins.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="w-full py-12 bg-gray-100">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-3xl font-semibold text-gray-800">
              Why Choose Project Hive?
            </h3>
            <p className="mt-4 text-gray-600">
              Project Hive is more than just a project management tool. It's an ecosystem designed to make project management more efficient and user-friendly for both educators and students. Whether you're tracking progress, assigning tasks, or providing feedback, Project Hive has you covered.
            </p>
            <ul className="mt-8 text-gray-600">
              <li className="mt-2">Centralized platform for project management.</li>
              <li className="mt-2">Improved communication between students and lecturers.</li>
              <li className="mt-2">Streamlined feedback and review process.</li>
              <li className="mt-2">Customized access for admins to manage roles and projects.</li>
            </ul>
          </div>
        </section>

        {/* Call to Action Section */}
        <section id="cta" className="w-full py-12 bg-emerald-700">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-3xl font-semibold text-white">
              Ready to Get Started?
            </h3>
            <p className="mt-4 text-white">
              Join Project Hive today and experience a more efficient way to manage your final year project. Take the first step towards success now!
            </p>
            <Link href="/pages/register" className="mt-4 inline-block bg-white text-emerald-700 py-2 px-4 rounded-md hover:bg-emerald-100">
              Sign Up Now
            </Link>
          </div>
        </section>

        <section id="github" className="w-full py-12 bg-gray-50">
                <div className="max-w-3xl mx-auto text-center">
                    <h3 className="text-3xl font-semibold text-gray-800">
                        Check Out The GitHub
                    </h3>
                    <p className="mt-4 text-gray-600">
                        The source code for Project Hive is available on GitHub. Feel free to explore the code, contribute, or check out the project's progress.
                    </p>
                    <div className="mt-6">
                        <a
                            href="https://github.com/MarianMendoza/ProjectHive" // Replace with your actual GitHub repository link
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center py-2 px-6 bg-emerald-700 text-white rounded-md hover:bg-emerald-800 transition duration-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.419 2.868 8.167 6.839 9.486.5.092.683-.217.683-.482v-1.72c-2.78.604-3.369-1.343-3.369-1.343-.455-1.155-1.11-1.463-1.11-1.463-.91-.623.068-.612.068-.612 1.004.071 1.531 1.039 1.531 1.039.892 1.521 2.341 1.084 2.91.83.091-.646.35-1.083.636-1.334-2.221-.253-4.557-1.111-4.557-4.933 0-1.09.388-1.982 1.03-2.68-.103-.253-.446-1.275.098-2.654 0 0 .84-.269 2.75 1.023a9.552 9.552 0 0 1 2.5-.335c.852 0 1.712.114 2.5.335 1.91-1.292 2.75-1.023 2.75-1.023.545 1.379.201 2.401.098 2.654.643.698 1.03 1.59 1.03 2.68 0 3.83-2.338 4.68-4.56 4.933.39.343.736 1.023.736 2.042v3.008c0 .266.183.577.683.482A9.955 9.955 0 0 0 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                            </svg>
                            View on GitHub
                        </a>
                    </div>
                </div>
            </section>
      </div>
    );
}
