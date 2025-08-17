import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SelectRoom: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="h-screen flex flex-col items-center pt-6 bg-pink-100 ">
            <h1 className="text-4xl font-bold mt-10 mb-8 text-red-600">Choose your way</h1>
            <div className="mt-10 flex gap-[140px] justify-center">
                {/* Card 1: Single Room */}
                <Card className="w-[380px] h-[460px] relative">
                    <CardContent className="p-4">
                        <h3 className="text-lg font-semibold">Single Room</h3>
                        <p className="text-sm text-gray-500">혼자 이용하기</p>
                    </CardContent>
                    <Button
                        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 py-3 px-6 text-lg bg-white text-primary border-2 border-primary rounded-full shadow-none hover:bg-gray-200 hover:shadow-none"
                        onClick={() => navigate("/create-room?type=single")}
                    >
                        Start
                    </Button>
                </Card>

                {/* Card 2: Group Room */}
                <Card className="w-[380px] h-[460px] relative">
                    <CardContent className="p-4">
                        <h3 className="text-lg font-semibold">Group Room</h3>
                        <p className="text-sm text-gray-500">여러 명 이용하기</p>
                    </CardContent>
                    <Button
                        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 py-3 px-6 text-lg bg-white text-primary border-2 border-primary rounded-full shadow-none hover:bg-gray-200 hover:shadow-none"
                        onClick={() => navigate("/create-room?type=group")}
                    >
                        Start
                    </Button>
                </Card>
            </div>
        </div>
    );
};

export default SelectRoom;
