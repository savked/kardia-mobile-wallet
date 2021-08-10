import React, { useEffect, useState } from 'react';
import { getDefaultDApp } from '../../../services/dapp';
import AllDAppsSection from './AllDAppsSection';
import FeaturedSection from './FeaturedSection';

export default () => {
  const [favDApp, setFavDApp] = useState<DAppMeta[]>([])

	useEffect(() => {
		(async () => {
			const rs = await getDefaultDApp()
			setFavDApp(rs)
		})()
	}, [])
  return (
    <>
      <FeaturedSection appList={favDApp.filter((item) => item.featured)} />
      <AllDAppsSection appList={favDApp} />
    </>
  )
}