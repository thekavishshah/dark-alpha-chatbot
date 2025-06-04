import React from 'react';
import { notFound } from 'next/navigation';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import GenerateAnswerSection from './generate-answer-section';
import { AIAnswerButton } from '@/components/ai-answer-button';   // NEW
import { getCompanyQuestionById } from '@/lib/db/queries';

interface PageProps {
  params: { uid: string; questionId: string };
}

const GenerateAnswerPage = async ({ params }: PageProps) => {
  const { uid, questionId } = params;

  /* fetch the question */
  const question = await getCompanyQuestionById(questionId);
  if (!question) return notFound();

  return (
    <div className="block-space-mini big-container flex justify-center items-start min-h-[60vh]">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-1">Generate Answer</CardTitle>
          <CardDescription className="mb-2">
            Generate an answer for the question.
          </CardDescription>
        </CardHeader>

        <Separator className="mb-4" />

        <div className="px-6 pb-8 space-y-6">
          {/* Existing question / instructions / answer textarea */}
          <GenerateAnswerSection
            question={question.title}
            companyId={uid}
            questionId={questionId}
          />

          {/* NEW: model picker + AI-draft button */}
          <AIAnswerButton companyId={uid} questionId={questionId} />
        </div>
      </Card>
    </div>
  );
};

export default GenerateAnswerPage;
