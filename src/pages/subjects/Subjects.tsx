import React, { useState } from 'react';
import { format } from 'date-fns';
import { PlusIcon, Pencil, Trash2 } from 'lucide-react';
import useSubjectsStore from '../../store/subjectsStore';
import Card, { CardContent, CardHeader } from '../../components/Card';
import Button from '../../components/Button';
import SubjectForm from './SubjectForm';
import { Subject } from '../../types';

const Subjects: React.FC = () => {
  const { subjects, deleteSubject } = useSubjectsStore();
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  
  const handleAdd = () => {
    setEditingSubject(null);
    setIsAddingSubject(true);
  };
  
  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setIsAddingSubject(true);
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      deleteSubject(id);
    }
  };
  
  const handleFormClose = () => {
    setIsAddingSubject(false);
    setEditingSubject(null);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
        <Button 
          onClick={handleAdd}
          className="flex items-center gap-1"
        >
          <PlusIcon className="h-4 w-4" />
          Add Subject
        </Button>
      </div>
      
      {isAddingSubject && (
        <SubjectForm 
          subjectToEdit={editingSubject}
          onClose={handleFormClose}
        />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.length > 0 ? (
          subjects.map((subject) => (
            <Card key={subject.id} className="border border-gray-200">
              <div 
                className="h-2 w-full rounded-t-lg"
                style={{ backgroundColor: subject.color }}
              />
              <CardContent className="pt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
                    <p className="text-sm text-gray-500">
                      Exam: {format(new Date(subject.examDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEdit(subject)}
                      className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(subject.id)}
                      className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${subject.priority === 'high' 
                        ? 'bg-red-100 text-red-800' 
                        : subject.priority === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }
                    `}>
                      {subject.priority} priority
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {subject.estimatedStudyHours} hours needed
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card className="border border-gray-200 text-center py-8">
              <CardContent>
                <p className="text-gray-500 mb-4">You haven't added any subjects yet.</p>
                <Button 
                  onClick={handleAdd}
                  className="inline-flex items-center gap-1"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Your First Subject
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subjects;