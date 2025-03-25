"use client";

export default function OpenDay() {
  return (
    <div className="flex flex-col items-center scroll-smooth mb-10">
      <div className="mb-6">
        <img
          src={"/image2.jpg"}
          alt="Student Dashboard Banner"
          className="w-screen h-64 object-cover rounded-b-lg "
        />
      </div>
      {/* Banner Section */}
      <section className="w-full m-auto p-20 text-white text-center">
        <h1 className="text-5xl font-bold text-lime-800">
          FYP Open Day
        </h1>
        <p className="mt-4 text-lg text-lime-800">
          Join us on April 2, 2025, for an exciting showcase of student
          projects!
        </p>
      </section>

      <section className="w-full px-6">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl font-semibold text-gray-800 text-center">
            Timetable - April 2, 2025
          </h3>
          <p className="mt-4 text-gray-600 text-center">
            Western Gateway Building
          </p>
          <div className="overflow-x-auto mt-6">
            <table className="min-w-full border border-gray-300 text-gray-800">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-4 py-2">Time</th>
                  <th className="border px-4 py-2">Event</th>
                  <th className="border px-4 py-2">Attendees</th>
                  <th className="border px-4 py-2">Location</th>
                  <th className="border px-4 py-2">Remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2">9am</td>
                  <td className="border px-4 py-2">Registration</td>
                  <td className="border px-4 py-2">Students and examiners</td>
                  <td className="border px-4 py-2">Desk near West entrance</td>
                  <td className="border px-4 py-2">Follow signs</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">9:15am-1pm</td>
                  <td className="border px-4 py-2">Morning Session</td>
                  <td className="border px-4 py-2">BScCS, BScDSA students</td>
                  <td className="border px-4 py-2">Various labs</td>
                  <td className="border px-4 py-2"></td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">1pm-2pm</td>
                  <td className="border px-4 py-2">Lunch Break</td>
                  <td className="border px-4 py-2">All attendees</td>
                  <td className="border px-4 py-2">--</td>
                  <td className="border px-4 py-2">Photo sessions scheduled</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">4pm-5pm</td>
                  <td className="border px-4 py-2">
                    Reception & Social Gathering
                  </td>
                  <td className="border px-4 py-2">
                    Project students, guests, UCC staff
                  </td>
                  <td className="border px-4 py-2">Canteen, ground floor</td>
                  <td className="border px-4 py-2">
                    Coffee & cake, short speeches
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
