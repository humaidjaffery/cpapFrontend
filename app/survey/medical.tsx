import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface SurveyData {
  currentCPAPUsage: string;
  maskType: string;
  sleepPosition: string;
  facialSensitivity: string;
  pressureLevel: string;
  hoursPerNight: string;
  additionalNotes: string;
}

export default function MedicalSurvey() {
  const [currentStep, setCurrentStep] = useState(0);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    currentCPAPUsage: '',
    maskType: '',
    sleepPosition: '',
    facialSensitivity: '',
    pressureLevel: '',
    hoursPerNight: '',
    additionalNotes: ''
  });

  const questions = [
    {
      id: 'currentCPAPUsage',
      question: 'Do you currently use a CPAP machine?',
      type: 'select',
      options: ['Yes, I use one regularly', 'Yes, but not regularly', 'No, but I have a prescription', 'No, I don\'t have one yet']
    },
    // {
    //   id: 'maskType',
    //   question: 'What type of mask do you currently use or prefer?',
    //   type: 'select',
    //   options: ['Nasal mask', 'Full face mask', 'Nasal pillows', 'I don\'t know', 'I don\'t have a preference']
    // },
    // {
    //   id: 'sleepPosition',
    //   question: 'What position do you sleep in most often?',
    //   type: 'select',
    //   options: ['Back (supine)', 'Side (left)', 'Side (right)', 'Stomach (prone)', 'I move around a lot']
    // },
    // {
    //   id: 'facialSensitivity',
    //   question: 'Do you have any facial sensitivities or allergies?',
    //   type: 'select',
    //   options: ['No sensitivities', 'Sensitive to silicone', 'Sensitive to certain materials', 'I\'m not sure']
    // },
    // {
    //   id: 'pressureLevel',
    //   question: 'What is your CPAP pressure level? (if known)',
    //   type: 'input',
    //   placeholder: 'e.g., 8 cm H2O'
    // },
    // {
    //   id: 'hoursPerNight',
    //   question: 'How many hours do you typically use CPAP per night?',
    //   type: 'select',
    //   options: ['Less than 4 hours', '4-6 hours', '6-8 hours', 'More than 8 hours', 'I don\'t know yet']
    // },
    // {
    //   id: 'additionalNotes',
    //   question: 'Any additional information that might help with your mask fitting?',
    //   type: 'input',
    //   placeholder: 'Optional: Describe any specific issues or preferences...'
    // }
  ];

  const handleAnswer = (questionId: string, answer: string) => {
    setSurveyData(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Here you would typically save the survey data
    console.log('Survey data:', surveyData);
    router.push('/survey/instructions');
  };

  const currentQuestion = questions[currentStep];

  return (
    <View className="flex-1 bg-background">
      {/* Progress Bar */}
      <View className="h-2 bg-border">
        <View 
          className="h-2 bg-primary" 
          style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
        />
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="space-y-6">
          {/* Progress Indicator */}
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-secondary">
              Question {currentStep + 1} of {questions.length}
            </Text>
            <Text className="text-sm text-secondary">
              {Math.round(((currentStep + 1) / questions.length) * 100)}%
            </Text>
          </View>

          {/* Question */}
          <View className="space-y-4">
            <Text className="text-2xl font-bold text-primary">
              {currentQuestion.question}
            </Text>

            {/* Answer Options */}
            {currentQuestion.type === 'select' ? (
              <View className="space-y-3">
                {currentQuestion.options?.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`p-4 rounded-lg border ${
                      surveyData[currentQuestion.id as keyof SurveyData] === option
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card'
                    }`}
                    onPress={() => handleAnswer(currentQuestion.id, option)}
                  >
                    <Text className={`font-medium ${
                      surveyData[currentQuestion.id as keyof SurveyData] === option
                        ? 'text-primary'
                        : 'text-primary'
                    }`}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <TextInput
                className="w-full p-4 border border-border rounded-lg bg-card text-primary"
                // placeholder={currentQuestion.placeholder}
                // placeholderTextColor="#6B7280"
                value={surveyData[currentQuestion.id as keyof SurveyData]}
                onChangeText={(text) => handleAnswer(currentQuestion.id, text)}
                multiline={currentQuestion.id === 'additionalNotes'}
                numberOfLines={currentQuestion.id === 'additionalNotes' ? 4 : 1}
              />
            )}
          </View>
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View className="p-6 space-y-3">
        {currentStep > 0 && (
          <TouchableOpacity
            className="w-full h-12 border border-border rounded-lg justify-center items-center"
            onPress={handleBack}
          >
            <Text className="text-primary font-semibold">Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          className={`w-full h-12 rounded-lg justify-center items-center ${
            surveyData[currentQuestion.id as keyof SurveyData]
              ? 'bg-primary'
              : 'bg-gray-300'
          }`}
          onPress={handleNext}
          disabled={!surveyData[currentQuestion.id as keyof SurveyData]}
        >
          <Text className={`font-semibold ${
            surveyData[currentQuestion.id as keyof SurveyData]
              ? 'text-white'
              : 'text-gray-500'
          }`}>
            {currentStep === questions.length - 1 ? 'Complete Survey' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 