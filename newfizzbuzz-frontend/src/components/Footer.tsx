import "../styles/styles.css"; // Import external CSS file

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <p>© {new Date().getFullYear()} NewFizzBuzz. All rights reserved.</p>
        </footer>
    );
};

export default Footer;
