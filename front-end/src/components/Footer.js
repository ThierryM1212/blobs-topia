import githubLogo from "../images/GitHub.png";
import wikipediaLogo from "../images/Wikipedia-logo.png";
import telegramLogo from "../images/telegram_logo.png";


export default function Footer() {
    return (
        <div className="footer w-100">
            <div >
                © 2022 Haileypdll/ThierryM1212
                &nbsp;
                <a href="https://github.com/ThierryM1212/blobs-topia" target="_blank" rel="noreferrer">
                    <img src={githubLogo} width="20" height="20" className="d-inline-block align-top" alt="github" />
                </a>
                &nbsp;
                <a href="https://t.me/+6-nvtIXx3_05YWI8" target="_blank" rel="noreferrer">
                    <img src={telegramLogo} width="20" height="20" className="d-inline-block align-top" alt="telegram" />
                </a>
                &nbsp;
                <a href="https://en.wikipedia.org/wiki/Physarum_polycephalum" target="_blank" rel="noreferrer">
                    <img src={wikipediaLogo} width="20" height="20" className="d-inline-block align-top" alt="wikipedia" />
                </a>
            </div>
        </div>
    )
}
