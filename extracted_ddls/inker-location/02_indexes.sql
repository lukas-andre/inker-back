CREATE INDEX "IDX_1ce699acff5d40d1b7ce70b1fc" ON public.artist_location CREATE INDEX "IDX_1ce699acff5d40d1b7ce70b1fc" ON artist_location USING gist (location);
CREATE INDEX "IDX_32b296abf35bf4c43f52239ba5" ON public.event_location CREATE INDEX "IDX_32b296abf35bf4c43f52239ba5" ON event_location USING gist (location);
