import useFirebaseAuth from "../../firebase/auth/useFirebaseAuth";

const AuthButton = () => {
    const { login, logout, authUser } = useFirebaseAuth();

    const handleLogin = async () => {
        await login();
    };

    const handleLogout = async () => {
        await logout();
    };

    return (
        <>
            {!authUser && <button onClick={handleLogin}>Login</button>}
            {authUser && <button onClick={handleLogout}>Logout</button>}
        </>
    );
};

export default AuthButton;
