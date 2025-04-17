import useFirebaseAuth from "../../firebase/auth/useFirebaseAuth";

export type TAuthButton = {
    loginText?: string;
    logoutText?: string;
};

const AuthButton = ({
    loginText = "Login",
    logoutText = "Logout",
}: TAuthButton) => {
    const { login, logout, authUser } = useFirebaseAuth();

    const handleLogin = async () => {
        await login();
    };

    const handleLogout = async () => {
        await logout();
    };

    return (
        <>
            {!authUser && <button onClick={handleLogin}>{loginText}</button>}
            {authUser && <button onClick={handleLogout}>{logoutText}</button>}
        </>
    );
};

export default AuthButton;
