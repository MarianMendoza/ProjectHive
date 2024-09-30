export default function Footer() {
    return <div>
        <footer className="bg-lime-500 w-full">
            <div className="w-full mx-auto max-w-screen-xl p-12 md:flex md:items-center md:justify-between">
                <span className="text-sm text-black sm:text-center">© 2024 <a href="" className="hover:underline">Marian Mendoza</a>. All Rights Reserved.
                </span>
                <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-black sm:mt-0">
                    <li>
                        <a href="#" className="hover:underline me-4 md:me-6">About</a>
                    </li>
                    <li>
                        <a href="#" className="hover:underline">Contact</a>
                    </li>
                </ul>
            </div>
        </footer>
    </div>
}