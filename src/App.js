import React, { useState, useEffect } from 'react';
import './index.css';
// import api from './api';

function QuizApp() {
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultDisease, setResultDisease] = useState('');
  const [symptomsSet, setSymptomsSet] = useState(new Set());

  useEffect(() => {
    fetch('/api/questions.json') // Replace with the actual URL
      .then((response) => response.json())
      .then((data) => {
        setQuestions(data);
        setUserAnswers(new Array(data.length).fill([]));
      })
      .catch((error) => {
        console.error('Error fetching questions:', error);
      });
  }, []);

  const handleOptionSelect = (selectedOption) => {
    const newAnswers = [...userAnswers];
    const currentAnswers = newAnswers[currentQuestion];
    const currentQuestionKey = questions[currentQuestion].key;

    if (selectedOption === 'Yes') {
      symptomsSet.add(currentQuestionKey);
    }

    if (selectedOption === 'Yes') {
      if (currentAnswers.includes('No')) {
        currentAnswers.splice(currentAnswers.indexOf('No'), 1);
      }
    } else if (selectedOption === 'No') {
      if (currentAnswers.includes('Yes')) {
        currentAnswers.splice(currentAnswers.indexOf('Yes'), 1);
      }
    }

    if (currentAnswers.includes(selectedOption)) {
      currentAnswers.splice(currentAnswers.indexOf(selectedOption), 1);
    } else {
      currentAnswers.push(selectedOption);
    }

    newAnswers[currentQuestion] = currentAnswers;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleStartQuiz = () => {
    setCurrentQuestion(0);
    setQuizStarted(true);
    setShowResult(false);
    setSymptomsSet(new Set());
  };

  const handleQuizSubmit = () => {
    const symptomsList = Array.from(symptomsSet);

    const dataToSend = { symptoms: symptomsList };

    fetch('http://localhost:8000/find-diseases', {
      mode: 'no-cors',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && data.diseases) {
          setShowResult(true); // Show the result immediately
          setResultDisease(data.diseases.join(', '));
        }
      })
      .catch((error) => {
        console.error('Error sending symptoms to the server:', error);
      });
  };


  return (
    <div className="container">
      <h1>Disease Detection</h1>
      {quizStarted ? (
        currentQuestion >= 0 && currentQuestion < questions.length ? (
          <div>
            <h2>Question {currentQuestion + 1}</h2>
            <p>{questions[currentQuestion].question}</p>
            <div className="options">
              <div className="option">
                <label>
                  <input
                    type="checkbox"
                    value="Yes"
                    onChange={() => handleOptionSelect('Yes')}
                    checked={userAnswers[currentQuestion].includes('Yes')}
                  />
                  Yes
                </label>
              </div>
              <div className="option">
                <label>
                  <input
                    type="checkbox"
                    value="No"
                    onChange={() => handleOptionSelect('No')}
                    checked={userAnswers[currentQuestion].includes('No')}
                  />
                  No
                </label>
              </div>
            </div>
            {currentQuestion < questions.length - 1 && (
              <button onClick={handleNextQuestion} className="next-button">
                Next
              </button>
            )}
            {currentQuestion === questions.length - 1 && (
              <button onClick={handleQuizSubmit} className="submit-button">
                Submit
              </button>
            )}
          </div>
        ) : (
          <div>
            <h2>Quiz Completed</h2>
            {currentQuestion === questions.length - 1 && (
              <button onClick={handleQuizSubmit} className="submit-button">
                Submit
              </button>
            )}
          </div>
        )
      ) : (
        <button onClick={handleStartQuiz} className="start-button">
          Start Quiz
        </button>
      )}

      {showResult && (
        <div className="result-window">
          <h2>Result</h2>
          <p>Disease Detected: {resultDisease}</p>
        </div>
      )}
    </div>
  );
}

export default QuizApp;
