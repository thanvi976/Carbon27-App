import React, { forwardRef } from 'react';
import { View, Text, ImageBackground } from 'react-native';

export const CertificateView = forwardRef(({ data }: any, ref: any) => {
  const displayName = String(data?.name ?? 'User').trim() || 'User';
  const badgeLabel = data?.badge ?? data?.level ?? 'Eco';
  const levelLabel = data?.level ?? 'Eco';

  return (
    <View
      ref={ref}
      collapsable={false}
      style={{
        width: 1280,
        height: 720,
      }}
    >
      <ImageBackground
        source={require('../../../assets/certificate-bg.png')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <Text
          style={{
            position: 'absolute',
            top: 150,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: 44,
            fontWeight: 'bold',
            color: 'rgb(40,120,130)',
            letterSpacing: 1,
          }}
        >
          {displayName}
        </Text>

        <Text
          style={{
            position: 'absolute',
            top: 350,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: 85,
            fontWeight: 'bold',
            color: 'rgb(90,170,80)',
            lineHeight: 117,
          }}
        >
          {data?.score ?? 0}
        </Text>

        <Text
          style={{
            position: 'absolute',
            top: 545,
            left: 210,
            width: 440,
            textAlign: 'center',
            fontSize: 24,
            fontWeight: 'bold',
            color: 'white',
          }}
        >
          Badge: {badgeLabel}
        </Text>

        <Text
          style={{
            position: 'absolute',
            top: 545,
            right: 190,
            width: 440,
            textAlign: 'center',
            fontSize: 24,
            fontWeight: 'bold',
            color: 'white',
          }}
        >
          Level: {levelLabel}
        </Text>

        <Text
          style={{
            position: 'absolute',
            top: 630,
            left: 200,
            fontSize: 20,
            color: 'rgb(198,223,222)',
          }}
        >
          Certificate ID: {data?.certId || 'C27-XXXX'}
        </Text>

        <Text
          style={{
            position: 'absolute',
            top: 630,
            right: 200,
            width: 440,
            textAlign: 'right',
            fontSize: 20,
            color: 'rgb(198,223,222)',
          }}
        >
          Issued on:{' '}
          {data?.date ||
            new Date().toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
        </Text>

        <Text
          style={{
            position: 'absolute',
            bottom: 9,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: 20,
            color: 'rgb(190,210,200)',
            lineHeight: 32,
          }}
        >
          carbon27.ai{'\n'}Track. Reduce. Sustain. Repeat.
        </Text>
      </ImageBackground>
    </View>
  );
});
