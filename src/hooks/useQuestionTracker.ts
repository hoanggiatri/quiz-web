import { useEffect, useRef, useCallback } from 'react';

interface UseQuestionTrackerOptions {
  questions: { id: string }[];
  currentQuestionIndex: number;
  onQuestionChange: (questionIndex: number) => void;
  enabled?: boolean;
}

export const useQuestionTracker = ({
  questions,
  currentQuestionIndex,
  onQuestionChange,
  enabled = true
}: UseQuestionTrackerOptions) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Scroll to a specific question
  const scrollToQuestion = useCallback((questionIndex: number, behavior: 'smooth' | 'instant' = 'smooth') => {
    const question = questions[questionIndex];
    if (!question) return;

    isScrollingRef.current = true;
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const questionElement = document.getElementById(`question-${question.id}`);
    if (questionElement) {
      questionElement.scrollIntoView({ 
        behavior, 
        block: 'start',
        inline: 'nearest'
      });

      // Reset scrolling flag after animation completes
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, behavior === 'smooth' ? 1000 : 100);
    }
  }, [questions]);

  // Scroll to first question of a page
  const scrollToPageStart = useCallback((page: number, questionsPerPage: number) => {
    const firstQuestionIndex = (page - 1) * questionsPerPage;
    scrollToQuestion(firstQuestionIndex, 'smooth');
  }, [scrollToQuestion]);

  // Setup Intersection Observer
  useEffect(() => {
    if (!enabled || questions.length === 0) return;

    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '-20% 0px -60% 0px', // Trigger when question is in upper part of viewport
      threshold: [0, 0.1, 0.5, 0.9, 1.0]
    };

    observerRef.current = new IntersectionObserver((entries) => {
      // Don't update during programmatic scrolling
      if (isScrollingRef.current) return;

      // Find the most visible question
      let mostVisibleEntry: IntersectionObserverEntry | null = null;
      let maxVisibility = 0;

      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > maxVisibility) {
          maxVisibility = entry.intersectionRatio;
          mostVisibleEntry = entry;
        }
      });

      if (mostVisibleEntry) {
        const questionId = mostVisibleEntry.target.id.replace('question-', '');
        const questionIndex = questions.findIndex(q => q.id === questionId);
        
        if (questionIndex !== -1 && questionIndex !== currentQuestionIndex) {
          onQuestionChange(questionIndex);
        }
      }
    }, observerOptions);

    // Observe all question elements
    const questionElements = document.querySelectorAll('[id^="question-"]');
    questionElements.forEach(element => {
      if (observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        questionElements.forEach(element => {
          observerRef.current?.unobserve(element);
        });
        observerRef.current.disconnect();
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [questions, currentQuestionIndex, onQuestionChange, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    scrollToQuestion,
    scrollToPageStart,
    isScrolling: isScrollingRef.current
  };
};
