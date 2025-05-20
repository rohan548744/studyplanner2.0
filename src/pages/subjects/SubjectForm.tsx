import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import useSubjectsStore from '../../store/subjectsStore';
import Card, { CardContent, CardHeader, CardFooter } from '../../components/Card';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import { Subject } from '../../types';

interface SubjectFormProps {
  subjectToEdit: Subject | null;
  onClose: () => void;
}

interface SubjectFormData {
  name: string;
  examDate: string;
  priority: 'low' | 'medium' | 'high';
  estimatedStudyHours: number;
}

const SubjectForm: React.FC<SubjectFormProps> = ({ subjectToEdit, onClose }) => {
  const { addSubject, updateSubject } = useSubjectsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<SubjectFormData>({
    defaultValues: subjectToEdit ? {
      name: subjectToEdit.name,
      examDate: subjectToEdit.examDate.toISOString().split('T')[0],
      priority: subjectToEdit.priority,
      estimatedStudyHours: subjectToEdit.estimatedStudyHours,
    } : {
      priority: 'medium',
      estimatedStudyHours: 10,
    }
  });
  
  const onSubmit = (data: SubjectFormData) => {
    setIsSubmitting(true);
    
    try {
      if (subjectToEdit) {
        updateSubject(subjectToEdit.id, {
          ...data,
          examDate: new Date(data.examDate),
        });
      } else {
        addSubject({
          ...data,
          examDate: new Date(data.examDate),
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting subject:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="border border-gray-200 mb-6">
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">
          {subjectToEdit ? 'Edit Subject' : 'Add New Subject'}
        </h2>
      </CardHeader>
      <CardContent>
        <form id="subject-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Subject Name"
              id="name"
              {...register('name', { required: 'Subject name is required' })}
              error={errors.name?.message}
              placeholder="e.g., Mathematics"
            />
            
            <Input
              label="Exam Date"
              id="examDate"
              type="date"
              {...register('examDate', { required: 'Exam date is required' })}
              error={errors.examDate?.message}
            />
            
            <Select
              label="Priority"
              id="priority"
              {...register('priority')}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
            />
            
            <Input
              label="Estimated Study Hours"
              id="estimatedStudyHours"
              type="number"
              {...register('estimatedStudyHours', { 
                required: 'Study hours are required',
                min: { value: 1, message: 'Must be at least 1 hour' },
                max: { value: 100, message: 'Cannot exceed 100 hours' }
              })}
              error={errors.estimatedStudyHours?.message}
              min={1}
              max={100}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="subject-form"
          isLoading={isSubmitting}
        >
          {subjectToEdit ? 'Update' : 'Add'} Subject
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SubjectForm;