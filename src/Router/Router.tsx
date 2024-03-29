import {Route, Routes} from 'react-router-dom';
import LoginPage from '../components/pages/LoginPage/LoginPage';
import PrivateRoute from './PrivateRoute';
import UserTable from '../components/pages/UserPage/UserTable';
import authorities from '../config/Authorities';
import HomePage from "../components/pages/HomePage";
import ListPage from "../components/pages/ListPage/ListPage";
import AdminPage from "../components/pages/AdminPage/AdminPage";

/**
 * Router component renders a route switch with all available pages
 */

const Router = () => {
    //const { checkRole } = useContext(ActiveUserContext);

    /** navigate to different "home"-locations depending on Role the user have */

    return (
        <Routes>

            <Route path={'/home'} element={<HomePage/>}/>
            <Route path={'/'} element={<LoginPage/>}/>
            <Route path={'/lists'} element={<ListPage/>}/>
            <Route path={'/admin'} element={<AdminPage/>}/>

            <Route
                path={'/users'}
                element={<PrivateRoute requiredAuths={[]} element={<UserTable onEdit={() => {
                }} submitActionHandler={() => {
                }}/>}/>}
            />


            <Route
                path='/useredit'
                element={
                    <PrivateRoute
                        requiredAuths={[authorities.USER_DEACTIVATE, authorities.USER_CREATE]}
                        element={<AdminPage/>}
                    ></PrivateRoute>
                }
            />
            <Route
                path='/useredit/:userId'
                element={
                    <PrivateRoute
                        requiredAuths={[authorities.USER_READ]}
                        element={<AdminPage/>}
                    ></PrivateRoute>
                }
            />

            <Route path='*' element={<div>Not Found</div>}/>
        </Routes>
    );
};

export default Router;
