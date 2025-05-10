import Image from "next/image";
import loader from "@/assets/loader.gif";

const LoadingPage = () => {
    return <div>
        <div className="flex h-screen w-full items-center justify-center">
            <Image
                src={loader}
                alt="Loading..."
                width={100}
                height={100}
                priority={true}
            />
        </div>
    </div>;
}
 
export default LoadingPage;