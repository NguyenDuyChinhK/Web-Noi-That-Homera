import { useEffect } from 'react';
import './App.css';
import Header from './Components/Header/Header';
import HomePage from './Components/HomePage/HomePage';
import Footer from './Components/Footer/Footer';
import Chatbot from './utils/Chatbot/Chatbot';

function App() {
    useEffect(() => {
        document.title = 'Nội Thất Homera | Miễn Phí Giao Hàng & Lắp Đặt Tận Phòng';
    }, []);

    return (
        <div>
            <header>
                <Header />
            </header>
            <Chatbot />
            <main>
                <HomePage />
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default App;
