
export default function home(){
    return (
        <div className="flex flex-col items-center">
        

        <section className="container mx-auto px-6 py-12 flex flex-col md:flex-row items-center md:space-x-10">
        <div className="w-full md:w-1/2">
            <div className="relative w-full h-70 md:h-70">
              <img
                src= {"../images/image1.jpg"} // Replace with your image path
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
            <button
              type="submit"
              className=" mt-2 w-40 flex  justify-center rounded-md bg-lime-600 px-1 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-lime-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600"
            >
              Sign Up
            </button>
            
          </div>
  
          
        </section>

        <section className="w-full py-12 bg-lime-600">
          <h2 className="text-4xl font-bold text-center text-white md:text-5xl lg:text-6xl">
            Welcome to Project Hive
          </h2>
          <p className="mt-4 text-center text-white md:text-lg">
          With Project Hive, you have the ability to monitor progress. This tool is designed to improve project workflow, making it easy to track and manage every stage.
          </p>
        </section>
  
  
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
              className="mt-4 inline-block bg-lime-600 text-white py-2 px-4 rounded-md hover:bg-lime-500"
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
      </div>
    );
}