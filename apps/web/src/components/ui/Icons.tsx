/**
 * ── BEATBR Icon System ─────────────────────────────────────────
 * Centralized Lucide React icon exports.
 * Import from here instead of 'lucide-react' directly for consistency.
 *
 * Usage:
 *   import { Ic } from '@/components/ui/Icons'
 *   <Ic.Feed size={20} strokeWidth={1.75} />
 */

import {
    Zap, Trophy, PlusCircle, FileText, User, ShoppingBag,
    Repeat2, FolderOpen, Gem, Settings, LayoutDashboard,
    Search, Bell, LogOut, ChevronRight, ChevronDown, ChevronLeft,
    X, Home, BarChart2, Users, Briefcase, Music, Star, Package,
    Sparkles, MessageSquare, Lock, Radio, Mic2, Heart, HeartOff,
    Share2, Play, Pause, Send, Check, CheckCircle2, AlertCircle,
    Info, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ExternalLink,
    Upload, Download, Image, FileAudio, Video, Trash2, Edit3,
    Copy, Link2, Globe, MapPin, Clock, Calendar, TrendingUp,
    TrendingDown, Eye, EyeOff, Filter, MoreHorizontal, MoreVertical,
    RefreshCw, Plus, Minus, Hash, AtSign, Phone, Mail, Bookmark,
    BookmarkCheck, Award, Flame, DollarSign, CreditCard, ShieldCheck,
    ShieldAlert, Headphones, Volume2, VolumeX, Shuffle, SkipForward,
    SkipBack, Repeat, ListMusic, Mic, Camera, QrCode, SlidersHorizontal,
    Tag, Layers, Grid3x3, List, LayoutGrid
} from 'lucide-react';

// Named icon map for semantic usage across the app
export const Ic = {
    // Navigation
    Feed: Zap,
    Rankings: Trophy,
    Post: PlusCircle,
    Deals: Briefcase,
    Profile: User,
    Dashboard: LayoutDashboard,
    Discover: Search,
    Marketplace: ShoppingBag,
    Collabs: Repeat2,
    MyCollabs: FolderOpen,
    Sell: Gem,
    Settings: Settings,
    Home: Home,

    // Actions
    Publish: PlusCircle,
    Edit: Edit3,
    Delete: Trash2,
    Copy: Copy,
    Share: Share2,
    Send: Send,
    Upload: Upload,
    Download: Download,
    Refresh: RefreshCw,
    Filter: Filter,
    Add: Plus,
    Remove: Minus,
    Close: X,
    Back: ChevronLeft,
    Forward: ChevronRight,
    Open: ExternalLink,
    Link: Link2,

    // Media
    Music: Music,
    Track: FileAudio,
    Video: Video,
    Image: Image,
    Mic: Mic2,
    Headphones: Headphones,
    Play: Play,
    Pause: Pause,
    SkipForward: SkipForward,
    SkipBack: SkipBack,
    Volume: Volume2,
    Mute: VolumeX,
    Shuffle: Shuffle,
    Repeat: Repeat,
    Playlist: ListMusic,
    Camera: Camera,

    // Social
    Like: Heart,
    Unlike: HeartOff,
    Comment: MessageSquare,
    Bookmark: Bookmark,
    BookmarkDone: BookmarkCheck,
    Bell: Bell,
    Star: Star,

    // Status & Feedback
    Check: Check,
    CheckCircle: CheckCircle2,
    Error: AlertCircle,
    Info: Info,
    Shield: ShieldCheck,
    ShieldAlert: ShieldAlert,
    Lock: Lock,
    Verified: ShieldCheck,
    Fire: Flame,
    Award: Award,
    Sparkles: Sparkles,
    Trending: TrendingUp,
    Falling: TrendingDown,

    // Data
    Chart: BarChart2,
    Users: Users,
    Eye: Eye,
    EyeOff: EyeOff,
    Tag: Tag,
    Hash: Hash,
    At: AtSign,
    Globe: Globe,
    Map: MapPin,
    Clock: Clock,
    Calendar: Calendar,
    Layers: Layers,

    // Commerce
    Dollar: DollarSign,
    Card: CreditCard,
    Package: Package,

    // UI
    More: MoreHorizontal,
    MoreV: MoreVertical,
    Radio: Radio,
    Sliders: SlidersHorizontal,
    QR: QrCode,
    GridView: Grid3x3,
    ListView: List,
    LayoutGrid: LayoutGrid,

    // Auth
    Logout: LogOut,
    Mail: Mail,
    Phone: Phone,

    // Nav arrows
    ChevronRight: ChevronRight,
    ChevronDown: ChevronDown,
    ArrowRight: ArrowRight,
    ArrowLeft: ArrowLeft,
    ArrowUp: ArrowUp,
    ArrowDown: ArrowDown,
};

// Direct re-exports for destructured import style
export {
    Zap, Trophy, PlusCircle, FileText, User, ShoppingBag,
    Repeat2, FolderOpen, Gem, Settings, LayoutDashboard,
    Search, Bell, LogOut, ChevronRight, ChevronDown, ChevronLeft,
    X, Home, BarChart2, Users, Briefcase, Music, Star, Package,
    Sparkles, MessageSquare, Lock, Radio, Mic2, Heart, HeartOff,
    Share2, Play, Pause, Send, Check, CheckCircle2, AlertCircle,
    Info, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ExternalLink,
    Upload, Download, Image, FileAudio, Video, Trash2, Edit3,
    Copy, Link2, Globe, MapPin, Clock, Calendar, TrendingUp,
    TrendingDown, Eye, EyeOff, Filter, MoreHorizontal, MoreVertical,
    RefreshCw, Plus, Minus, Hash, AtSign, Phone, Mail, Bookmark,
    BookmarkCheck, Award, Flame, DollarSign, CreditCard, ShieldCheck,
    ShieldAlert, Headphones, Volume2, VolumeX, Shuffle, SkipForward,
    SkipBack, Repeat, ListMusic, Mic, Camera, QrCode, SlidersHorizontal,
    Tag, Layers, Grid3x3, List, LayoutGrid
};
