import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Main: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="relative h-screen bg-pink-100">
            <div className="absolute bottom-[30px] left-1/2 w-[40%] -translate-x-1/2 text-center">
                <Button
                    className="mx-auto py-8 px-20 text-lg mb-5 bg-white text-primary border-2 border-primary rounded-full shadow-none hover:bg-gray-200 hover:shadow-none"
                    onClick={() => navigate("/create-room")}
                >
                    START
                </Button>
            </div>
        </div>
    );
};

export default Main;
