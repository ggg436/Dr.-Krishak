import { useState } from "react";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from "firebase/storage";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { useEffect } from "react";

type FileItem = {
  name: string;
  url: string;
  fullPath: string;
};

export default function StorageDemo() {
  const [file, setFile] = useState<File | null>(null);
  const [fileList, setFileList] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError("");
      
      const storageRef = ref(storage, "files");
      const result = await listAll(storageRef);
      
      const filePromises = result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          url,
          fullPath: itemRef.fullPath,
        };
      });
      
      const files = await Promise.all(filePromises);
      setFileList(files);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!file) return;
    
    try {
      setUploading(true);
      setError("");
      
      // Create a reference with a unique filename
      const storageRef = ref(storage, `files/${Date.now()}-${file.name}`);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const url = await getDownloadURL(storageRef);
      
      // Add to file list
      setFileList([...fileList, {
        name: file.name,
        url,
        fullPath: storageRef.fullPath,
      }]);
      
      // Reset file input
      setFile(null);
      const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (fullPath: string) => {
    try {
      setError("");
      
      // Create a reference to the file
      const fileRef = ref(storage, fullPath);
      
      // Delete the file
      await deleteObject(fileRef);
      
      // Remove from list
      setFileList(fileList.filter(item => item.fullPath !== fullPath));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Firebase Storage Demo</CardTitle>
        <CardDescription>Upload and manage files with Firebase Storage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <Input
              id="fileUpload"
              type="file"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <Button 
              onClick={uploadFile} 
              disabled={!file || uploading}
            >
              {uploading ? "Uploading..." : "Upload File"}
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading files...</div>
          ) : error ? (
            <div className="text-red-500 py-4">{error}</div>
          ) : fileList.length === 0 ? (
            <div className="text-center py-4">No files uploaded yet.</div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Uploaded Files</h3>
              <ul className="space-y-2">
                {fileList.map((item) => (
                  <li key={item.fullPath} className="border rounded-lg p-3 flex justify-between items-center">
                    <div className="flex-1 truncate">
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate"
                      >
                        {item.name}
                      </a>
                    </div>
                    <Button 
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteFile(item.fullPath)}
                    >
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 