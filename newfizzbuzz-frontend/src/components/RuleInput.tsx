import { Rule } from "../types/Rule";
import "../styles/styles.css";

interface RuleInputProps {
    rule: Rule;
    onChange: (updatedRule: Rule) => void;
    onRemove: () => void;
}

const RuleInput: React.FC<RuleInputProps> = ({ rule, onChange, onRemove }) => {
    return (
        <div className="rule-input">
            <input
                type="number"
                value={rule.divisor}
                onChange={(e) => onChange({ ...rule, divisor: parseInt(e.target.value) })}
                placeholder="Divisor"
            />
            <input
                type="text"
                value={rule.word}
                onChange={(e) => onChange({ ...rule, word: e.target.value })}
                placeholder="Word"
            />
            <button onClick={onRemove} className="remove-rule">Remove</button>
        </div>
    );
};

export default RuleInput;
