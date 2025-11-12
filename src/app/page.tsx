'use client'

import { useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import {
  ArrowPathIcon,
  CloudArrowUpIcon,
  FingerPrintIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Product', href: '#' },
  { name: 'Features', href: '#' },
  { name: 'Company', href: '#' },
]

const features = [
  {
    name: 'Generate Weeks of Content Instantly',
    description:
      'BlogO creates up to 30 startup-relevant posts in seconds — ready for LinkedIn and X. Save hours each week and stay consistent online without hiring a content team.',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'Optimized for Startups',
    description:
      'Each post is tailored to your startup’s tone, product, and audience — from funding updates to product launches. BlogO learns your style and writes like your brand.',
    icon: FingerPrintIcon,
  },
  {
    name: 'Smart Scheduling',
    description:
      'Our smart scheduler posts your content at the best times for engagement on LinkedIn and X — so you never miss a chance to connect with your audience.',
    icon: ArrowPathIcon,
  },
  {
    name: 'Team Collaboration',
    description:
      'Invite your team to review, edit, or approve posts before publishing. Keep your brand voice unified while collaborating seamlessly.',
    icon: LockClosedIcon,
  },
]

export default function Example() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div>
      {/* Header section */}
      <div className="bg-gray-900">
        <header className="absolute inset-x-0 top-0 z-50">
          <nav
            aria-label="Global"
            className="flex items-center justify-between p-6 lg:px-8"
          >
            <div className="flex lg:flex-1">
              <a href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">BlogO</span>
                <img
                  alt="BlogO logo"
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                  className="h-8 w-auto"
                />
              </a>
            </div>
            <div className="flex lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-200"
              >
                <span className="sr-only">Open main menu</span>
                <Bars3Icon aria-hidden="true" className="size-6" />
              </button>
            </div>
            <div className="hidden lg:flex lg:gap-x-12">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-sm/6 font-semibold text-white"
                >
                  {item.name}
                </a>
              ))}
            </div>
            <div className="hidden lg:flex lg:flex-1 lg:justify-end">
              <a href="#" className="text-sm/6 font-semibold text-white">
                Log in <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </nav>
          <Dialog
            open={mobileMenuOpen}
            onClose={setMobileMenuOpen}
            className="lg:hidden"
          >
            <div className="fixed inset-0 z-50" />
            <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gray-900 p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-100/10">
              <div className="flex items-center justify-between">
                <a href="#" className="-m-1.5 p-1.5">
                  <span className="sr-only">BlogO</span>
                  <img
                    alt="BlogO logo"
                    src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                    className="h-8 w-auto"
                  />
                </a>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="-m-2.5 rounded-md p-2.5 text-gray-200"
                >
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon aria-hidden="true" className="size-6" />
                </button>
              </div>
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-white/10">
                  <div className="space-y-2 py-6">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-white/5"
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                  <div className="py-6">
                    <a
                      href="#"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white hover:bg-white/5"
                    >
                      Log in
                    </a>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </Dialog>
        </header>

        {/* Hero Section */}
        <div className="relative isolate px-6  lg:px-8">
          <div className="mx-auto max-w-2xl py-32 text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">
              Consistent, high-quality content for your startup — powered by AI
            </h1>
            <p className="mt-8 text-lg font-medium text-gray-400 sm:text-xl/8">
              BlogO helps startups stay visible online by generating and
              scheduling weeks of LinkedIn and X posts — automatically crafted to
              match your brand and voice.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="#"
                className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Get started free
              </a>
              <a href="#" className="text-sm/6 font-semibold text-white">
                See how it works <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base/7 font-semibold text-indigo-400">
              For startups, built by founders
            </h2>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Everything you need to stay consistent on social media
            </p>
            <p className="mt-6 text-lg text-gray-300">
              BlogO removes the content grind — generate, optimize, and schedule
              posts that make your startup look active and professional.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-4xl">
            <dl className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.name} className="relative pl-16">
                  <dt className="text-base font-semibold text-white">
                    <div className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-indigo-500">
                      <feature.icon
                        aria-hidden="true"
                        className="size-6 text-white"
                      />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-2 text-base text-gray-400">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900">
        <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="relative isolate overflow-hidden bg-gray-800 px-6 pt-16 sm:rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
            <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Stop worrying about your next post.
              </h2>
              <p className="mt-6 text-lg text-gray-300">
                Let BlogO handle your content strategy — from generation to
                scheduling — so your startup can focus on growth.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
                <a
                  href="#"
                  className="rounded-md bg-gray-700 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Try BlogO free
                </a>
                <a
                  href="#"
                  className="text-sm font-semibold text-white hover:text-gray-100"
                >
                  Learn more <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
            {/* <div className="relative mt-16 h-80 lg:mt-8">
              <img
                alt="BlogO dashboard"
                src="https://tailwindcss.com/plus-assets/img/component-images/dark-project-app-screenshot.png"
                width={1824}
                height={1080}
                className="absolute top-0 left-0 w-228 max-w-none rounded-md bg-white/5 ring-1 ring-white/10"
              />
            </div> */}
          </div>
        </div>
      </div>
    </div>
  )
}
