export default function PageNotFound(){
    return(
        <section className="container mx-auto px-6 py-12 flex flex-col md:flex-row items-center md:space-x-10">
        <div className="w-full md:w-1/2">
            <div className="relative w-full h-70 md:h-70">
              <img
                src= {"/image1.jpg"} 
                alt="Project Management"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl font-semibold text-gray-800">
                404
            </h1>
            <p className="mt-4 text-gray-600">
                Sorry we could not find this page.
            </p>
          </div>   
        </section>

    )
} 