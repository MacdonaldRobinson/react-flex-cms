import EditableContent from "../../components/EditableContent/EditableContent";

const HomePage = () => {
    return (
        <>
            <EditableContent contentId="Header">
                <h1>Home Page</h1>
            </EditableContent>
            <EditableContent contentId="Summary">
                <p>Welcome to the home page</p>
            </EditableContent>
        </>
    );
};

export default HomePage;
