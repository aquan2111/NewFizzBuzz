import { useState } from "react";
import { createQuiz } from "../services/QuizService";
import { useNavigate } from "react-router-dom";
import { Quiz } from "../types/Quiz";
import { Rule } from "../types/Rule";
import RuleInput from "../components/RuleInput";
import "../styles/styles.css";

const CreateQuizPage = () => {
    const [title, setTitle] = useState("");
    const [rules, setRules] = useState<Rule[]>([]);
    const [errorMessage, setErrorMessage] = useState(""); // ✅ Add error message state
    const navigate = useNavigate();
    const userId = Number(localStorage.getItem("userId"));

    const handleAddRule = () => {
        setRules([...rules, { id: Date.now(), divisor: 3, word: "Fizz" }]);
    };

    const handleChangeRule = (index: number, updatedRule: Rule) => {
        const updatedRules = [...rules];
        updatedRules[index] = updatedRule;
        setRules(updatedRules);
    };

    const handleRemoveRule = (index: number) => {
        setRules(rules.filter((_, i) => i !== index));
    };

    const handleCreateQuiz = async () => {
        if (!title || rules.length === 0) {
            setErrorMessage("Title and at least one rule are required.");
            return;
        }

        const newQuiz: Omit<Quiz, "id"> = { title, rules, authorId: userId };

        try {
            await createQuiz(newQuiz);
            navigate("/quizzes");
        } catch (error: any) {
            setErrorMessage(error.message); // Display backend error
        }
    };

    return (
        <div className="create-quiz-page">
            <h2>Create Quiz</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Display error message */}
            <input 
                type="text" 
                placeholder="Quiz Title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
            />
            <div className="rules-section">
                <h3>Rules</h3>
                {rules.map((rule, index) => (
                    <RuleInput
                        key={rule.id}
                        rule={rule}
                        onChange={(updatedRule) => handleChangeRule(index, updatedRule)}
                        onRemove={() => handleRemoveRule(index)}
                    />
                ))}
                <button onClick={handleAddRule}>Add Rule</button>
            </div>
            <button onClick={handleCreateQuiz}>Create Quiz</button>
        </div>
    );
};

export default CreateQuizPage;
