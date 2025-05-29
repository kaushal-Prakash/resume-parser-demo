"use client";
import axios from 'axios';
import { useState } from 'react';
import { FaFilePdf, FaUpload, FaSpinner } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Education = {
  degree: string;
  institution: string;
  year: string;
  description?: string;
};

type Experience = {
  title: string;
  company: string;
  duration: string;
  description?: string;
};

type SocialLink = {
  name: "Linkedin" | "Github" | "Leetcode" | "Portfolio" | string;
  url: string;
};

type Contact = {
  email: string;
  phone: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  leetcode?: string;
};

type ParsedData = {
  firstname: string;
  lastname: string;
  about: string;
  title: string;
  yearOfExperience: number;
  education: Education[];
  experience: Experience[];
  skills: string[];
  socialLinks: SocialLink[];
  contact: Contact;
} | null;

export default function ResumeParser() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [parsedData, setParsedData] = useState<ParsedData>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast.error('Please upload a valid PDF file');
      setFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a PDF file first');
      return;
    }

    if (loading) return;

    setLoading(true);
    toast.info('Processing your resume...');

    try {
      const formData = new FormData();
      formData.append('resume', file);
      // Replace with your actual API endpoint
      const response = await axios.post("http://localhost:5050/api/parse", formData);

      if (response.status !== 200) {
        throw new Error('Failed to parse resume');
      }

      const data = await response.data.text;

      const jsonRes = await axios.post("http://localhost:5050/api/get-json",{
        text:data,
      });
      setParsedData(jsonRes.data);
      toast.success('Resume parsed successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to parse resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="container mx-auto p-4 max-w-4xl flex-grow">
        <h1 className="text-3xl font-bold mb-6 text-center text-green-700 mt-8">Resume Parser Pro</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-green-100">
          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            <div className="mb-4 w-full">
              <label 
                htmlFor="resume-upload" 
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-green-300 rounded-lg cursor-pointer hover:bg-green-50 transition-colors"
              >
                <div className="flex flex-col items-center justify-center">
                  <FaFilePdf className="text-green-600 text-4xl mb-2" />
                  <p className="text-sm text-gray-600">
                    {file ? file.name : 'Upload your resume (PDF only)'}
                  </p>
                  {!file && (
                    <p className="text-xs text-gray-400 mt-1">Max file size: 5MB</p>
                  )}
                </div>
                <input 
                  id="resume-upload" 
                  type="file" 
                  accept="application/pdf" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
            </div>
            
            <button
              type="submit"
              disabled={loading || !file}
              className={`flex items-center px-6 cursor-pointer py-3 rounded-lg text-white font-medium ${
                loading || !file 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 transition-colors'
              }`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <FaUpload className="mr-2" />
                  Parse Resume
                </>
              )}
            </button>
          </form>
        </div>

        {parsedData && (
          <div className="bg-white rounded-lg shadow-lg p-6 border border-green-100">
            <h2 className="text-xl font-semibold mb-4 text-green-700">Parsed Resume Data</h2>
            <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm border border-gray-200">
              {JSON.stringify(parsedData, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <footer className="bg-green-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="italic mb-2">"Your career is a story. Make sure it's a bestseller."</p>
          <p className="text-sm text-green-200">© {new Date().getFullYear()} devShadow | Helping professionals shine</p>
        </div>
      </footer>

      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastStyle={{
          backgroundColor: '#f0fdf4',
          color: '#065f46',
        }}
      />
    </div>
  );
}