import { Link } from 'wouter';
import { useState } from 'react';
import { ImageIcon } from 'lucide-react';

interface ProjectCardProps {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
}

const ProjectCard = ({ id, title, category, imageUrl }: ProjectCardProps) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    console.error(`Failed to load project image: ${imageUrl}`);
    setImageError(true);
  };

  return (
    <div className="flex flex-col reveal active">
      <div className="project-card relative overflow-hidden group shadow-lg rounded-lg">
        {imageError ? (
          <div className="w-full h-72 bg-gray-200 flex flex-col items-center justify-center">
            <ImageIcon className="h-20 w-20 text-gray-400 mb-2" />
            <p className="text-gray-500 text-sm">Image unavailable</p>
          </div>
        ) : (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
            onError={handleImageError}
          />
        )}
        <div className="project-overlay absolute inset-0 flex flex-col justify-center items-center p-6 text-white">
          <Link href={`/projects/${id}`} className="border border-white text-white py-2 px-6 font-montserrat text-sm tracking-wider inline-block hover:bg-[#1E90DB] hover:border-[#1E90DB] hover:text-white transition-colors">
            VIEW PROJECT
          </Link>
        </div>
      </div>
      {/* Project details section always visible below the image */}
      <div className="bg-white p-4 border border-t-0 border-gray-200 rounded-b-lg">
        <h4 className="text-lg font-montserrat font-bold text-gray-900 mb-1">{title}</h4>
        <p className="text-[#1E90DB] text-sm font-medium">{category}</p>
      </div>
    </div>
  );
};

export default ProjectCard;
