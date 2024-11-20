'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const UpdateProjectPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    title: '',
    status: 'Available',
    visibility: 'Private',
    description: '',
    files: '',
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`../../api/projects/${id}`);
        const data = await response.json();

        if (response.ok) {
          setProject(data.project);
          setFormData({
            title: data.project.title,
            status: data.project.status,
            visibility: data.project.visibility,
            description: data.project.description || '',
            files: data.project.files || '',
          });
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Error fetching project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`../../api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('../projects'); // Redirect to the projects page after successful update
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error updating project');
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-10 flex items-center justify-center ">
      <div className='w-full'>
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8">Update Project</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-lg text-gray-700 mb-2">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-600"
                required
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-lg text-gray-700 mb-2">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-600"
                required
              >
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div>
              <label htmlFor="visibility" className="block text-lg text-gray-700 mb-2">Visibility</label>
              <select
                id="visibility"
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-600"
                required
              >
                <option value="Private">Private</option>
                <option value="Public">Public</option>
              </select>
            </div>

            <div className="col-span-2">
              <label htmlFor="description" className="block text-lg text-gray-700 mb-2">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-600"
                rows={4}
              />
            </div>

            <div className="col-span-2">
              <label htmlFor="files" className="block text-lg text-gray-700 mb-2">Files</label>
              <input
                type="text"
                id="files"
                name="files"
                value={formData.files}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-600"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="bg-lime-600 text-white px-8 py-3 rounded-xl hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-600"
            >
              Update Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProjectPage;
