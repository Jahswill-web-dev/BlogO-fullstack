'use client';
import React from 'react'
import { GoogleLoginButton } from '@/components/ui/googleloginbutton';
import { LogInIcon } from 'lucide-react'
export default function LoginPage() {
    return (
        <div className="flex flex-col md:flex-row w-full min-h-screen bg-white">
            {/* Branding Section */}
            <div className="w-full md:w-1/2 bg-linear-to-br from-blue-500 to-purple-600 p-8 md:p-12 flex flex-col justify-between text-white">
                <div>
                    <div className="flex items-center mb-8">
                        <span className="text-3xl font-bold">BlogO</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Consistent content, effortless growth.          
                    </h1>
                    <p className="text-lg md:text-xl opacity-90 mb-8">
                        BlogO writes and schedules your startup’s content so you can focus on building.
                    </p>
                </div>
                <div className="hidden md:block">
                    <p className="text-sm opacity-75">
                        © 2023 BlogO. All rights reserved.
                    </p>
                </div>
            </div>
            {/* Login Section */}
            <div className="w-full md:w-1/2 flex justify-center items-center p-8 md:p-12">
                <div className="max-w-md w-full">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            Sign in to BlogO
                        </h2>
                        <p className="text-gray-600">
                        create this weeks content in 5 minutes.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <GoogleLoginButton />
                        <div className="flex items-center justify-center mt-8 text-sm text-gray-500">
                            <LogInIcon size={16} className="mr-2" />
                            <span>Single sign-on enabled for your convenience</span>
                        </div>
                    </div>
                    <div className="mt-12 text-center text-sm text-gray-500">
                        <p>Don't have an account?</p>
                        <p className="mt-1">
                            <span className="text-blue-600 font-medium cursor-pointer hover:text-blue-800">
                                Contact your administrator
                            </span>
                        </p>
                    </div>
                </div>
            </div>
            {/* Mobile Footer */}
            <div className="md:hidden w-full p-4 text-center text-sm text-gray-500 bg-gray-50">
                <p>© 2023 BlogO. All rights reserved.</p>
            </div>
        </div>
    )
}
