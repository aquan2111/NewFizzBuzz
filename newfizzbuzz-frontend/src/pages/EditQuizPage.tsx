import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getQuizById, updateQuiz } from "../services/QuizService";  // Adjust import paths
import { Quiz } from "../types/Quiz";

const EditQuizPage = () => {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [title, setTitle] = useState<string>("");
    const [rules, setRules] = useState<{ divisor: number; word: string }[]>([]);
    const { quizId } = useParams();  // Get quizId from URL params
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuiz = async () => {
            if (!quizId) return;
            try {
                const fetchedQuiz = await getQuizById(Number(quizId));
                setQuiz(fetchedQuiz);
                setTitle(fetchedQuiz.title);
                setRules(fetchedQuiz.rules);
                setError(null);
            } catch (error) {
                console.error("Error fetching quiz:", error);
                setError("Failed to fetch quiz"); // Ensure error message is set
                setQuiz(null);
            }
        };
    
        fetchQuiz();
    }, [quizId]);
    

    // Handle rule change (divisor and word)
    const handleRuleChange = (index: number, field: string, value: string | number) => {
        setRules((prevRules) => {
            const updatedRules = [...prevRules];
            updatedRules[index] = {
                ...updatedRules[index],
                [field]: value,
            };
            return updatedRules;
        });
    };

    // Add a new empty rule
    const handleAddRule = () => {
        setRules((prevRules) => [...prevRules, { divisor: 0, word: "" }]);
    };

    // Remove a rule by index
    const handleRemoveRule = (index: number) => {
        setRules((prevRules) => prevRules.filter((_, i) => i !== index));
    };

    const handleUpdate = async () => {
        if (quiz === null) return <div>Failed to fetch quiz</div>;

        try {
            await updateQuiz(quiz.id, {
                title,
                rules: rules.map(({ divisor, word }) => ({ divisor, word })), // Remove `id`
            });
            navigate("/quizzes");
        } catch (error) {
            console.error("Error updating quiz:", error);
        }
    };

    if (error) return <div role="alert">{error}</div>; // Ensure error message is in a recognizable role
    if (!quiz) return <div>Loading...</div>;

    return (
        <div>
            <h2>Edit Quiz</h2>
            <form onSubmit={(e) => e.preventDefault()}>
                <div>
                    <label>Title</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                    />
                </div>

                <div>
                    <h3>Rules</h3>
                    {rules.map((rule, index) => (
                        <div key={index} className="rule">
                            <div>
                                <label htmlFor={`divisor-${index}`}>Divisor</label>
                                <input
                                    id={`divisor-${index}`}
                                    type="number"
                                    value={rule.divisor}
                                    onChange={(e) => handleRuleChange(index, "divisor", Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label htmlFor={`word-${index}`}>Word</label>
                                <input
                                    id={`word-${index}`}
                                    type="text"
                                    value={rule.word}
                                    onChange={(e) => handleRuleChange(index, "word", e.target.value)}
                                />
                            </div>
                            <button type="button" onClick={() => handleRemoveRule(index)}>
                                Remove Rule
                            </button>
                        </div>
                    ))}

                    <button type="button" onClick={handleAddRule}>
                        Add Rule
                    </button>
                </div>

                <button type="button" onClick={handleUpdate}>Update Quiz</button>
            </form>
        </div>
    );
};

export default EditQuizPage;
