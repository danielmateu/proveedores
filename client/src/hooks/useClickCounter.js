import { format } from "date-fns";
const apiURL = import.meta.env.VITE_API_URL

export default function useClickCounter() {
    const handleUpdateClick = async (event) => {
        let BtnName;

        if (typeof event === 'string') {
            BtnName = event
        }else{
            BtnName = event.target.textContent.trim() || event
        }
        // quitar porcentaje del btnname
        const filteredBtnName = BtnName.replace(/[0-9%]/g, '').trim();

        try {
            const LoginID = localStorage.getItem("LoginID")

            const response = await fetch(`${apiURL}/homecontroller/ClickCounter`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    LoginID, 
                    BtnName: filteredBtnName, 
                    Date: format(new Date(), "yyyyMMdd").toString(),
                })
            })

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
        } catch (error) {
            console.error(error);
        }
    }

  return {handleUpdateClick}
}
