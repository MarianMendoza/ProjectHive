'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function UpdateProjectPage() {
    const router = useRouter();
    const { id } = router.query; // Get the dynamic route parameter
    const [project, setProject] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        status: '',
        visibility: '',
        description: '',
        files: '',
    });

    useEffect(() => {
        if (id) {
            // Fetch project information by ID
            fetch(`/api/projects/${id}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.project) {
                        setProject(data.project);
                        setFormData({
                            title: data.project.title,
                            status: data.project.status,
                            visibility: data.project.visibility,
                            description: data.project.description,
                            files: data.project.files,
                        });
                    }
                })
                .catch((error) => console.error('Error fetching project:', error));
        }
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await res.json();
            if (res.ok) {
                alert('Project updated successfully!');
                router.push('/projects'); // Redirect to projects page
            } else {
                alert(result.message || 'Failed to update project');
            }
        } catch (error) {
            console.error('Error updating project:', error);
        }
    };

    if (!project) {
        return <p>Loading...</p>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
            <h1 className="text-2xl font-bold mb-4">Update Project</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <input
                        type="text"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Visibility</label>
                    <input
                        type="text"
                        name="visibility"
                        value={formData.visibility}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    ></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Files</label>
                    <input
                        type="text"
                        name="files"
                        value={formData.files}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                >
                    Confirm
                </button>
            </form>
        </div>
    );
}
