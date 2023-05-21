#%%
import numpy as np
import pandas as pd
#%%
raw = pd.read_csv('https://github.com/mattharrison/datasets/raw/master/data/alta-noaa-1980-2019.csv',
                  parse_dates = ['DATE'])
#%%
my_cols = ['STATION', 'NAME', 'LATITUDE', 'LONGITUDE', 'ELEVATION', 'DATE',
           'PRCP', 'SNOW', 'SNWD', 'TMAX', 'TMIN', 'TOBS']

# def tweak_alta(df):
#     return (df
#             .loc[:, ['STATION', 'NAME', 'LATITUDE', 'LONGITUDE', 'ELEVATION', 'DATE',
#                      'PRCP', 'SNOW', 'SNWD', 'TMAX', 'TMIN', 'TOBS']]
#             )

(raw
 [my_cols]
 .groupby(pd.Grouper(key='DATE', freq='W'))
 .agg({'PRCP': 'sum', 'TMAX': 'max', 'TMIN': 'min', 'SNOW': 'sum', 'SNWD': 'mean'})
 .reset_index()
 .assign(LOCATION='Alta',
         SEASON='Ski')
 .assign(LOCATION=lambda df_: df_.LOCATION.where(
    df_.DATE.dt.year >= 2000
    ,'Alta Ski Resort'),
         T_RANGE=lambda df_: df_.TMAX - df_.TMIN,
         SEASON=lambda df_:(df_
                            .SEASON
                            .where(
             (df_.DATE.dt.month <= 4) | (df_.DATE.dt.month >= 11), 'Summer')
                            .add(' ')
                            .add(df_
                                 .DATE.dt.year.astype(str)
                                 .where(df_.DATE.dt.month > 4,
                                        (df_.DATE.dt.year - 1).astype(str))))
         )
 )
#%%
