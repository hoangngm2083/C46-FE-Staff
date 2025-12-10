import useAuthService from '../services/authService'
import { FaArrowRightFromBracket } from 'react-icons/fa6'

export default function LogoutButton() {
  const { logout } = useAuthService()

  const handleLogout = () => {
    try {
      logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors duration-200"
    >
      <FaArrowRightFromBracket className="w-4 h-4 mr-2" />
      Đăng xuất
    </button>
  )
}
