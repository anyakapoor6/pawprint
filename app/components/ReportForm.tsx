import React, { useState } from 'react';
import { Alert, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { createReport } from '../services/reports';
import { Pet } from '../types/pets';
import { PetReport } from '@/types/pet';

interface ReportFormProps {
	onReportSubmitted?: (report: PetReport) => void;
}

const ReportForm: React.FC<ReportFormProps> = ({ onReportSubmitted }) => {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
	const [reportType, setReportType] = useState<'lost' | 'found'>('lost');
	const [description, setDescription] = useState('');
	const [location, setLocation] = useState('');
	const [latitude, setLatitude] = useState<number | null>(null);
	const [longitude, setLongitude] = useState<number | null>(null);
	const [contactInfo, setContactInfo] = useState('');
	const [imageUris, setImageUris] = useState<string[]>([]);

	const submitReport = async () => {
		if (!validateForm()) return;
		if (!selectedPet) {
			Alert.alert('Error', 'Please select a pet');
			return;
		}

		setIsSubmitting(true);
		try {
			const reportData = {
				name: selectedPet.name,
				type: selectedPet.species as 'dog' | 'cat',
				breed: selectedPet.breed || '',
				color: selectedPet.description || '',
				size: 'medium' as 'medium',
				gender: 'unknown',
				ageCategory: 'adult' as 'adult',
				description: description,
				photos: imageUris,
				reportType: reportType,
				status: 'active' as 'active',
				isUrgent: false,
				lastSeenDate: new Date().toISOString(),
				lastSeenLocation: latitude && longitude && location ? { latitude, longitude, address: location } : undefined,
				reward: undefined,
				contactInfo: { name: '', email: contactInfo },
				tags: [],
				userId: 'user-id-placeholder',
				dateReported: new Date().toISOString(),
			};

			const { data: newReport, error } = await createReport(reportData);

			if (error) {
				throw error;
			}

			if (!newReport) {
				throw new Error('Failed to create report');
			}

			// Update the reports list in the parent component
			if (onReportSubmitted) {
				onReportSubmitted(newReport);
			}

			// Show success message
			Alert.alert(
				'Success',
				'Report submitted successfully',
				[
					{
						text: 'OK',
						onPress: () => {
							// Reset form
							setReportType('lost');
							setDescription('');
							setLocation('');
							setLatitude(null);
							setLongitude(null);
							setContactInfo('');
							setImageUris([]);
							setSelectedPet(null);
							// Navigate back
							router.back();
						},
					},
				]
			);
		} catch (error) {
			console.error('Error submitting report:', error);
			Alert.alert(
				'Error',
				'Failed to submit report. Please try again.'
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const validateForm = () => {
		if (!selectedPet) {
			Alert.alert('Error', 'Please select a pet');
			return false;
		}
		if (!description.trim()) {
			Alert.alert('Error', 'Please provide a description');
			return false;
		}
		if (!location.trim()) {
			Alert.alert('Error', 'Please provide a location');
			return false;
		}
		if (!contactInfo.trim()) {
			Alert.alert('Error', 'Please provide contact information');
			return false;
		}
		return true;
	};

	return (
		<Button title="Submit Report" onPress={submitReport} disabled={isSubmitting} />
	);
};

export default ReportForm; 