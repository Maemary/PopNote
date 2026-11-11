import { Route, Routes } from 'react-router'
import Header from './components/Headers'
import BrowsePage from './pages/BrowsePage'
import MovieDetailPage from './pages/MovieDetailPage'
import TvDetailPage from './pages/TvDetailPage'
import SearchPage from './pages/SearchPage'
import LoginPage from './pages/LoginPage'
import MyListPage from './pages/MyListPage'
import GenrePage from './pages/GenrePage'
import AboutPage from './pages/AboutPage'
import ListPage from './pages/ListPage'
import Footer from './components/Footer'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<BrowsePage section="home" />} />
        <Route path="/movies" element={<BrowsePage section="movie" />} />
        <Route path="/tv-shows" element={<BrowsePage section="tv" />} />
        <Route path="/anime" element={<BrowsePage section="anime" />} />
        <Route path="/animation" element={<BrowsePage section="animation" />} />
        <Route path="/world" element={<BrowsePage section="world" />} />
        <Route path="/list/:id" element={<ListPage />} />
        <Route path="/genre/:slug" element={<GenrePage />} />
        <Route path="/movie/:id" element={<MovieDetailPage />} />
        <Route path="/tv/:id" element={<TvDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/login" element={<LoginPage key="signin" mode="signin" />} />
        <Route path="/signup" element={<LoginPage key="signup" mode="signup" />} />
        <Route path="/my-list" element={<MyListPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
